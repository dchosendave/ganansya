import {
	assertActorUserExists,
	getActorUserId,
	getRequiredArg,
	getUserByMobileNumber,
	insertAuditEvent,
	normalizeRequiredMobileNumber,
	nowAsIsoString,
	parseArgs,
	rowNumber,
	rowNumber as getRowNumber,
	exitWithError
} from './_helpers.mjs';
import { getDatabase } from './_helpers.mjs';

const args = parseArgs();
const mobileNumber = normalizeRequiredMobileNumber(getRequiredArg(args, 'mobile-number'));
const actorUserId = getActorUserId(args);

await assertActorUserExists(actorUserId);

const user = await getUserByMobileNumber(mobileNumber);

if (!user) {
	exitWithError(`User with mobile number ${mobileNumber} does not exist.`);
}

if (getRowNumber(user, 'is_active') !== 1) {
	console.log(`User ${mobileNumber} is already inactive.`);
	process.exit(0);
}

await getDatabase().execute({
	sql: `UPDATE users
	SET is_active = 0,
		auth_version = auth_version + 1,
		updated_at = :updatedAt
	WHERE mobile_number = :mobileNumber`,
	args: {
		updatedAt: nowAsIsoString(),
		mobileNumber
	}
});

await insertAuditEvent({
	userId: rowNumber(user, 'id'),
	actorUserId,
	mobileNumberAttempted: mobileNumber,
	eventType: 'user_deactivated'
});

console.log(`Deactivated ${mobileNumber}.`);
