import { verifyPin } from '$lib/server/auth/pin';
import {
	countRecentLoginEventsByIp,
	countRecentLoginEventsByIpAndMobile,
	getUserByMobileNumber,
	insertAuditEvent,
	recordSuccessfulLogin,
	updateFailedLoginState
} from '$lib/server/auth/repository';
import { ACCOUNT_LOCKED_MESSAGE, INVALID_CREDENTIALS_MESSAGE } from '$lib/server/auth/messages';
import {
	IP_AND_MOBILE_ATTEMPT_MAX,
	IP_ATTEMPT_MAX,
	IP_ATTEMPT_WINDOW_MINUTES,
	LOGIN_LOCK_MAX_ATTEMPTS,
	LOGIN_LOCK_WINDOW_MINUTES
} from '$lib/server/auth/settings';
import {
	addMinutesToIsoString,
	isIsoStringInFuture,
	nowAsIsoString,
	subtractMinutesFromIsoString
} from '$lib/server/auth/time';

type LoginContext = {
	ipAddress: string;
	userAgent: string;
};

type AuthenticateLoginResult =
	| { ok: true; user: NonNullable<Awaited<ReturnType<typeof getUserByMobileNumber>>> }
	| { ok: false; status: number; message: string };

function isInsideFailureWindow(windowStartedAt: string | null, nowIsoString: string) {
	return Boolean(
		windowStartedAt &&
		windowStartedAt >= subtractMinutesFromIsoString(nowIsoString, LOGIN_LOCK_WINDOW_MINUTES)
	);
}

export async function authenticateLogin(
	mobileNumber: string,
	pin: string,
	context: LoginContext
): Promise<AuthenticateLoginResult> {
	const nowIsoString = nowAsIsoString();
	const throttleWindowStartsAt = subtractMinutesFromIsoString(
		nowIsoString,
		IP_ATTEMPT_WINDOW_MINUTES
	);
	const ipAttemptCount = await countRecentLoginEventsByIp(
		context.ipAddress,
		throttleWindowStartsAt
	);
	const ipAndMobileAttemptCount = await countRecentLoginEventsByIpAndMobile(
		context.ipAddress,
		mobileNumber,
		throttleWindowStartsAt
	);

	if (ipAttemptCount >= IP_ATTEMPT_MAX || ipAndMobileAttemptCount >= IP_AND_MOBILE_ATTEMPT_MAX) {
		await insertAuditEvent({
			mobileNumberAttempted: mobileNumber,
			eventType: 'login_throttled',
			eventReason:
				ipAndMobileAttemptCount >= IP_AND_MOBILE_ATTEMPT_MAX
					? 'ip_mobile_throttled'
					: 'ip_throttled',
			ipAddress: context.ipAddress,
			userAgent: context.userAgent,
			createdAt: nowIsoString
		});

		return {
			ok: false,
			status: 429,
			message: INVALID_CREDENTIALS_MESSAGE
		};
	}

	const user = await getUserByMobileNumber(mobileNumber);

	if (!user) {
		await insertAuditEvent({
			mobileNumberAttempted: mobileNumber,
			eventType: 'login_failed',
			eventReason: 'unknown_mobile_number',
			ipAddress: context.ipAddress,
			userAgent: context.userAgent,
			createdAt: nowIsoString
		});

		return {
			ok: false,
			status: 401,
			message: INVALID_CREDENTIALS_MESSAGE
		};
	}

	if (!user.isActive) {
		await insertAuditEvent({
			userId: user.id,
			mobileNumberAttempted: mobileNumber,
			eventType: 'login_failed',
			eventReason: 'inactive_user',
			ipAddress: context.ipAddress,
			userAgent: context.userAgent,
			createdAt: nowIsoString
		});

		return {
			ok: false,
			status: 401,
			message: INVALID_CREDENTIALS_MESSAGE
		};
	}

	if (isIsoStringInFuture(user.lockedUntil, nowIsoString)) {
		await insertAuditEvent({
			userId: user.id,
			mobileNumberAttempted: mobileNumber,
			eventType: 'login_locked',
			eventReason: 'account_locked',
			ipAddress: context.ipAddress,
			userAgent: context.userAgent,
			createdAt: nowIsoString
		});

		return {
			ok: false,
			status: 423,
			message: ACCOUNT_LOCKED_MESSAGE
		};
	}

	const pinMatches = await verifyPin(pin, user.pinHash);

	if (!pinMatches) {
		const windowActive = isInsideFailureWindow(user.failedLoginWindowStartedAt, nowIsoString);
		const nextFailedLoginAttempts = windowActive ? user.failedLoginAttempts + 1 : 1;
		const failedLoginWindowStartedAt = windowActive
			? user.failedLoginWindowStartedAt
			: nowIsoString;
		const shouldLockAccount = nextFailedLoginAttempts >= LOGIN_LOCK_MAX_ATTEMPTS;
		const lockedUntil = shouldLockAccount
			? addMinutesToIsoString(nowIsoString, LOGIN_LOCK_WINDOW_MINUTES)
			: null;

		await updateFailedLoginState({
			userId: user.id,
			failedLoginAttempts: nextFailedLoginAttempts,
			failedLoginWindowStartedAt,
			lockedUntil,
			updatedAt: nowIsoString
		});

		await insertAuditEvent({
			userId: user.id,
			mobileNumberAttempted: mobileNumber,
			eventType: 'login_failed',
			eventReason: 'invalid_pin',
			ipAddress: context.ipAddress,
			userAgent: context.userAgent,
			createdAt: nowIsoString
		});

		if (shouldLockAccount) {
			await insertAuditEvent({
				userId: user.id,
				mobileNumberAttempted: mobileNumber,
				eventType: 'login_locked',
				eventReason: 'too_many_failed_attempts',
				ipAddress: context.ipAddress,
				userAgent: context.userAgent,
				createdAt: nowIsoString
			});

			return {
				ok: false,
				status: 423,
				message: ACCOUNT_LOCKED_MESSAGE
			};
		}

		return {
			ok: false,
			status: 401,
			message: INVALID_CREDENTIALS_MESSAGE
		};
	}

	await recordSuccessfulLogin({
		userId: user.id,
		lastLoginAt: nowIsoString,
		updatedAt: nowIsoString
	});

	await insertAuditEvent({
		userId: user.id,
		mobileNumberAttempted: mobileNumber,
		eventType: 'login_success',
		ipAddress: context.ipAddress,
		userAgent: context.userAgent,
		createdAt: nowIsoString
	});

	return {
		ok: true,
		user: {
			...user,
			failedLoginAttempts: 0,
			failedLoginWindowStartedAt: null,
			lockedUntil: null,
			lastLoginAt: nowIsoString,
			updatedAt: nowIsoString
		}
	};
}
