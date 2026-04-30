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
	validateRole,
	exitWithError
} from './_helpers.mjs';
import { getDatabase } from './_helpers.mjs';

const args = parseArgs();
const displayName = getRequiredArg(args, 'display-name');
const mobileNumber = normalizeRequiredMobileNumber(getRequiredArg(args, 'mobile-number'));
const role = validateRole(getRequiredArg(args, 'role'));
const pin = validatePin(getRequiredArg(args, 'pin'));
const actorUserId = getActorUserId(args);

await assertActorUserExists(actorUserId);

const existingUser = await getUserByMobileNumber(mobileNumber);

if (existingUser) {
	exitWithError(`User with mobile number ${mobileNumber} already exists.`);
}

const createdAt = nowAsIsoString();
const pinHash = await hashPin(pin);
const result = await getDatabase().execute({
	sql: `INSERT INTO users (
		display_name,
		mobile_number,
		pin_hash,
		role,
		is_active,
		auth_version,
		failed_login_attempts,
		failed_login_window_started_at,
		locked_until,
		last_login_at,
		created_at,
		updated_at
	) VALUES (
		:displayName,
		:mobileNumber,
		:pinHash,
		:role,
		1,
		1,
		0,
		NULL,
		NULL,
		NULL,
		:createdAt,
		:createdAt
	) RETURNING id`,
	args: {
		displayName,
		mobileNumber,
		pinHash,
		role,
		createdAt
	}
});

const userId = rowNumber(result.rows[0], 'id');

await insertAuditEvent({
	userId,
	actorUserId,
	mobileNumberAttempted: mobileNumber,
	eventType: 'user_created',
	eventReason: 'seed_user'
});

console.log(`Created ${role} user ${displayName} (${mobileNumber}) with id ${userId}.`);
