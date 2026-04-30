import {
	assertActorUserExists,
	getActorUserId,
	getRequiredArg,
	getUserByMobileNumber,
	hashPin,
	insertAuditEvent,
	normalizeRequiredMobileNumber,
	nowAsIsoString,
	parseArgs,
	rowNumber,
	validatePin,
	exitWithError
} from './_helpers.mjs';
import { getDatabase } from './_helpers.mjs';

const args = parseArgs();
const mobileNumber = normalizeRequiredMobileNumber(getRequiredArg(args, 'mobile-number'));
const pin = validatePin(getRequiredArg(args, 'pin'));
const actorUserId = getActorUserId(args);

await assertActorUserExists(actorUserId);

const user = await getUserByMobileNumber(mobileNumber);

if (!user) {
	exitWithError(`User with mobile number ${mobileNumber} does not exist.`);
}

const updatedAt = nowAsIsoString();
const pinHash = await hashPin(pin);

await getDatabase().execute({
	sql: `UPDATE users
	SET pin_hash = :pinHash,
		auth_version = auth_version + 1,
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
	eventType: 'pin_reset'
});

console.log(`PIN reset completed for ${mobileNumber}.`);
