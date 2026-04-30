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
	rowString,
	validateRole,
	exitWithError
} from './_helpers.mjs';
import { getDatabase } from './_helpers.mjs';

const args = parseArgs();
const mobileNumber = normalizeRequiredMobileNumber(getRequiredArg(args, 'mobile-number'));
const role = validateRole(getRequiredArg(args, 'role'));
const actorUserId = getActorUserId(args);

await assertActorUserExists(actorUserId);

const user = await getUserByMobileNumber(mobileNumber);

if (!user) {
	exitWithError(`User with mobile number ${mobileNumber} does not exist.`);
}

if (rowString(user, 'role') === role) {
	console.log(`User ${mobileNumber} already has role ${role}.`);
	process.exit(0);
}

await getDatabase().execute({
	sql: `UPDATE users
	SET role = :role,
		auth_version = auth_version + 1,
		updated_at = :updatedAt
	WHERE mobile_number = :mobileNumber`,
	args: {
		role,
		updatedAt: nowAsIsoString(),
		mobileNumber
	}
});

await insertAuditEvent({
	userId: rowNumber(user, 'id'),
	actorUserId,
	mobileNumberAttempted: mobileNumber,
	eventType: 'role_changed',
	eventReason: `role_changed_to_${role}`
});

console.log(`Changed role of ${mobileNumber} to ${role}.`);
