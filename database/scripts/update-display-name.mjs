import {
	assertActorUserExists,
	exitWithError,
	getActorUserId,
	getRequiredArg,
	getUserByMobileNumber,
	insertAuditEvent,
	normalizeRequiredMobileNumber,
	nowAsIsoString,
	parseArgs,
	rowNumber
} from './_helpers.mjs';
import { getDatabase } from './_helpers.mjs';

const args = parseArgs();
const mobileNumber = normalizeRequiredMobileNumber(getRequiredArg(args, 'mobile-number'));
const displayName = getRequiredArg(args, 'display-name');
const actorUserId = getActorUserId(args);

await assertActorUserExists(actorUserId);

const user = await getUserByMobileNumber(mobileNumber);

if (!user) {
	exitWithError(`User with mobile number ${mobileNumber} does not exist.`);
}

await getDatabase().execute({
	sql: `UPDATE users
	SET display_name = :displayName,
		updated_at = :updatedAt
	WHERE mobile_number = :mobileNumber`,
	args: {
		displayName,
		updatedAt: nowAsIsoString(),
		mobileNumber
	}
});

await insertAuditEvent({
	userId: rowNumber(user, 'id'),
	actorUserId,
	mobileNumberAttempted: mobileNumber,
	eventType: 'display_name_changed'
});

console.log(`Updated display name for ${mobileNumber} to ${displayName}.`);
