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
const nextMobileNumber = normalizeRequiredMobileNumber(getRequiredArg(args, 'next-mobile-number'));
const actorUserId = getActorUserId(args);

await assertActorUserExists(actorUserId);

const user = await getUserByMobileNumber(mobileNumber);

if (!user) {
	exitWithError(`User with mobile number ${mobileNumber} does not exist.`);
}

if (mobileNumber === nextMobileNumber) {
	console.log('The new mobile number matches the current one.');
	process.exit(0);
}

const existingTargetUser = await getUserByMobileNumber(nextMobileNumber);

if (existingTargetUser) {
	exitWithError(`User with mobile number ${nextMobileNumber} already exists.`);
}

await getDatabase().execute({
	sql: `UPDATE users
	SET mobile_number = :nextMobileNumber,
		auth_version = auth_version + 1,
		updated_at = :updatedAt
	WHERE mobile_number = :mobileNumber`,
	args: {
		nextMobileNumber,
		updatedAt: nowAsIsoString(),
		mobileNumber
	}
});

await insertAuditEvent({
	userId: rowNumber(user, 'id'),
	actorUserId,
	mobileNumberAttempted: nextMobileNumber,
	eventType: 'mobile_number_changed',
	eventReason: `from_${mobileNumber}`
});

console.log(`Changed mobile number from ${mobileNumber} to ${nextMobileNumber}.`);
