import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

import { getDb } from '../../src/lib/server/db.js';

const scrypt = promisify(scryptCallback);
const PIN_LENGTH = 6;
const MOBILE_INPUT_MAX_LENGTH = 12;
const SCRYPT_KEY_LENGTH = 64;

export function parseArgs(argv = process.argv.slice(2)) {
	const args = {};

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];

		if (!token?.startsWith('--')) {
			continue;
		}

		const key = token.slice(2);
		const nextToken = argv[index + 1];

		if (!nextToken || nextToken.startsWith('--')) {
			args[key] = 'true';
			continue;
		}

		args[key] = nextToken;
		index += 1;
	}

	return args;
}

export function getRequiredArg(args, key) {
	const value = args[key];

	if (typeof value !== 'string' || !value.trim()) {
		exitWithError(`Missing required flag: --${key}`);
	}

	return value.trim();
}

export function getOptionalArg(args, key) {
	const value = args[key];
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function exitWithError(message) {
	console.error(message);
	process.exit(1);
}

export function nowAsIsoString() {
	return new Date().toISOString();
}

export function sanitizeMobileNumberInput(value) {
	return value.replace(/\D/g, '').slice(0, MOBILE_INPUT_MAX_LENGTH);
}

export function normalizeMobileNumber(value) {
	const digits = sanitizeMobileNumberInput(value);

	if (/^09\d{9}$/.test(digits)) {
		return `+63${digits.slice(1)}`;
	}

	if (/^639\d{9}$/.test(digits)) {
		return `+${digits}`;
	}

	return null;
}

export function normalizeRequiredMobileNumber(value) {
	const normalized = normalizeMobileNumber(value);

	if (!normalized) {
		exitWithError('Invalid mobile number. Use 09XXXXXXXXX or 639XXXXXXXXX.');
	}

	return normalized;
}

export function validateRole(value) {
	if (value !== 'operator' && value !== 'owner') {
		exitWithError('Invalid role. Use operator or owner.');
	}

	return value;
}

export function validatePin(value) {
	if (!/^\d{6}$/.test(value)) {
		exitWithError(`Invalid PIN. Use exactly ${PIN_LENGTH} digits.`);
	}

	return value;
}

export async function hashPin(pin) {
	const salt = randomBytes(16).toString('hex');
	const derivedKey = await scrypt(pin, salt, SCRYPT_KEY_LENGTH);

	return `${salt}:${Buffer.from(derivedKey).toString('hex')}`;
}

export function getActorUserId(args) {
	const value = getOptionalArg(args, 'actor-user-id');

	if (!value) {
		return null;
	}

	const actorUserId = Number(value);

	if (!Number.isInteger(actorUserId) || actorUserId <= 0) {
		exitWithError('Invalid --actor-user-id value.');
	}

	return actorUserId;
}

export function getDatabase() {
	return getDb();
}

export async function selectOne(sql, args = {}) {
	const result = await getDb().execute({ sql, args });
	return result.rows[0] ?? null;
}

export function rowNumber(row, key) {
	const value = row?.[key];
	return typeof value === 'bigint' ? Number(value) : Number(value ?? 0);
}

export function rowString(row, key) {
	const value = row?.[key];
	return typeof value === 'string' ? value : '';
}

export async function getUserByMobileNumber(mobileNumber) {
	return selectOne(
		`SELECT id, display_name, mobile_number, role, is_active, auth_version
		FROM users
		WHERE mobile_number = :mobileNumber
		LIMIT 1`,
		{ mobileNumber }
	);
}

export async function getUserById(id) {
	return selectOne(
		`SELECT id, display_name, mobile_number, role, is_active, auth_version
		FROM users
		WHERE id = :id
		LIMIT 1`,
		{ id }
	);
}

export async function assertActorUserExists(actorUserId) {
	if (!actorUserId) {
		return;
	}

	const actor = await getUserById(actorUserId);

	if (!actor) {
		exitWithError(`Actor user ${actorUserId} does not exist.`);
	}
}

export async function insertAuditEvent({
	userId = null,
	actorUserId = null,
	mobileNumberAttempted = null,
	eventType,
	eventReason = null
}) {
	await getDb().execute({
		sql: `INSERT INTO auth_audit (
			user_id,
			actor_user_id,
			mobile_number_attempted,
			event_type,
			event_reason,
			ip_address,
			user_agent,
			created_at
		) VALUES (
			:userId,
			:actorUserId,
			:mobileNumberAttempted,
			:eventType,
			:eventReason,
			:ipAddress,
			:userAgent,
			:createdAt
		)`,
		args: {
			userId,
			actorUserId,
			mobileNumberAttempted,
			eventType,
			eventReason,
			ipAddress: 'unknown',
			userAgent: 'database-script',
			createdAt: nowAsIsoString()
		}
	});
}
