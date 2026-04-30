import type { CurrentUser } from '$lib/auth/types';
import { verifyAuthToken } from '$lib/server/auth/jwt';
import { getUserById } from '$lib/server/auth/repository';
import type { DatabaseUser, SessionResolution } from '$lib/server/auth/types';

function toCurrentUser(user: DatabaseUser): CurrentUser {
	return {
		id: user.id,
		displayName: user.displayName,
		mobileNumber: user.mobileNumber,
		role: user.role
	};
}

export async function resolveSessionFromCookie(
	token: string | undefined
): Promise<SessionResolution> {
	if (!token) {
		return {
			state: 'missing',
			user: null,
			databaseUser: null
		};
	}

	const verificationResult = await verifyAuthToken(token);

	if (!verificationResult.ok) {
		return {
			state: verificationResult.reason,
			user: null,
			databaseUser: null
		};
	}

	const databaseUser = await getUserById(verificationResult.claims.userId);

	if (
		!databaseUser ||
		!databaseUser.isActive ||
		databaseUser.authVersion !== verificationResult.claims.authVersion ||
		databaseUser.role !== verificationResult.claims.role ||
		databaseUser.mobileNumber !== verificationResult.claims.mobileNumber
	) {
		return {
			state: 'invalid',
			user: null,
			databaseUser: null
		};
	}

	return {
		state: 'valid',
		user: toCurrentUser(databaseUser),
		databaseUser
	};
}
