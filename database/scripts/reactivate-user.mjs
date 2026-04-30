import {
	assertActorUserExists,
	getActorUserId,
	getOptionalArg,
	getRequiredArg,
	getUserByMobileNumber,
	hashPin,
	insertAuditEvent,
	normalizeRequiredMobileNumber,
	nowAsIsoString,
	parseArgs,
	rowNumber,
	rowNumber as getRowNumber,
	validatePin,
	exitWithError
} from './_helpers.mjs';
import { getDatabase } from './_helpers.mjs';

const args = parseArgs();
const mobileNumber = normalizeRequiredMobileNumber(getRequiredArg(args, 'mobile-number'));
const actorUserId = getActorUserId(args);
const nextPin = getOptionalArg(args, 'pin');

await assertActorUserExists(actorUserId);

const user = await getUserByMobileNumber(mobileNumber);

if (!user) {
	exitWithError(`User with mobile number ${mobileNumber} does not exist.`);
}

const updatedAt = nowAsIsoString();
const pinHash = nextPin ? await hashPin(validatePin(nextPin)) : null;

await getDatabase().execute({
	sql: `UPDATE users
	SET is_active = 1,
		auth_version = auth_version + 1,
		pin_hash = COALESCE(:pinHash, pin_hash),
		failed_login_attempts = 0,
		failed_login_window_started_at = NULL,
		locked_until = NULL,
		updated_at = :updatedAt
	WHERE mobile_number = :mobileNumber`,
	args: {
		pinHash,
		updatedAt,
		mobileNumber
	}
});

await insertAuditEvent({
	userId: rowNumber(user, 'id'),
	actorUserId,
	mobileNumberAttempted: mobileNumber,
	eventType: 'user_reactivated',
	eventReason: getRowNumber(user, 'is_active') === 1 ? 'already_active' : null
});

console.log(`Reactivated ${mobileNumber}.`);
