import type { InArgs } from '@libsql/client';

import { getDb } from '$lib/server/db.js';
import type { AuditEventInput, DatabaseUser } from '$lib/server/auth/types';

type RowValue = string | number | bigint | Uint8Array | null;
type RowRecord = Record<string, RowValue>;

function getString(row: RowRecord, key: string) {
	const value = row[key];
	return typeof value === 'string' ? value : '';
}

function getNullableString(row: RowRecord, key: string) {
	const value = row[key];
	return typeof value === 'string' ? value : null;
}

function getNumber(row: RowRecord, key: string) {
	const value = row[key];
	return typeof value === 'bigint' ? Number(value) : Number(value ?? 0);
}

function mapDatabaseUser(row: RowRecord): DatabaseUser {
	return {
		id: getNumber(row, 'id'),
		displayName: getString(row, 'display_name'),
		mobileNumber: getString(row, 'mobile_number'),
		pinHash: getString(row, 'pin_hash'),
		role: getString(row, 'role') === 'owner' ? 'owner' : 'operator',
		isActive: getNumber(row, 'is_active') === 1,
		authVersion: getNumber(row, 'auth_version'),
		failedLoginAttempts: getNumber(row, 'failed_login_attempts'),
		failedLoginWindowStartedAt: getNullableString(row, 'failed_login_window_started_at'),
		lockedUntil: getNullableString(row, 'locked_until'),
		lastLoginAt: getNullableString(row, 'last_login_at'),
		createdAt: getString(row, 'created_at'),
		updatedAt: getString(row, 'updated_at')
	};
}

async function selectOne(sql: string, args: InArgs = []) {
	const result = await getDb().execute({
		sql,
		args
	});

	return (result.rows[0] as RowRecord | undefined) ?? null;
}

export async function getUserById(id: number) {
	const row = await selectOne(
		`SELECT
			id,
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
		FROM users
		WHERE id = :id
		LIMIT 1`,
		{ id }
	);

	return row ? mapDatabaseUser(row) : null;
}

export async function getUserByMobileNumber(mobileNumber: string) {
	const row = await selectOne(
		`SELECT
			id,
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
		FROM users
		WHERE mobile_number = :mobileNumber
		LIMIT 1`,
		{ mobileNumber }
	);

	return row ? mapDatabaseUser(row) : null;
}

export async function insertAuditEvent(event: AuditEventInput) {
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
			userId: event.userId ?? null,
			actorUserId: event.actorUserId ?? null,
			mobileNumberAttempted: event.mobileNumberAttempted ?? null,
			eventType: event.eventType,
			eventReason: event.eventReason ?? null,
			ipAddress: event.ipAddress,
			userAgent: event.userAgent,
			createdAt: event.createdAt
		}
	});
}

export async function countRecentLoginEventsByIp(ipAddress: string, sinceIsoString: string) {
	const row = await selectOne(
		`SELECT COUNT(*) AS count
		FROM auth_audit
		WHERE ip_address = :ipAddress
			AND created_at >= :sinceIsoString
			AND event_type IN ('login_failed', 'login_locked', 'login_throttled')`,
		{ ipAddress, sinceIsoString }
	);

	return row ? getNumber(row, 'count') : 0;
}

export async function countRecentLoginEventsByIpAndMobile(
	ipAddress: string,
	mobileNumber: string,
	sinceIsoString: string
) {
	const row = await selectOne(
		`SELECT COUNT(*) AS count
		FROM auth_audit
		WHERE ip_address = :ipAddress
			AND mobile_number_attempted = :mobileNumber
			AND created_at >= :sinceIsoString
			AND event_type IN ('login_failed', 'login_locked', 'login_throttled')`,
		{ ipAddress, mobileNumber, sinceIsoString }
	);

	return row ? getNumber(row, 'count') : 0;
}

export async function updateFailedLoginState(input: {
	userId: number;
	failedLoginAttempts: number;
	failedLoginWindowStartedAt: string | null;
	lockedUntil: string | null;
	updatedAt: string;
}) {
	await getDb().execute({
		sql: `UPDATE users
		SET failed_login_attempts = :failedLoginAttempts,
			failed_login_window_started_at = :failedLoginWindowStartedAt,
			locked_until = :lockedUntil,
			updated_at = :updatedAt
		WHERE id = :userId`,
		args: input
	});
}

export async function recordSuccessfulLogin(input: {
	userId: number;
	lastLoginAt: string;
	updatedAt: string;
}) {
	await getDb().execute({
		sql: `UPDATE users
		SET failed_login_attempts = 0,
			failed_login_window_started_at = NULL,
			locked_until = NULL,
			last_login_at = :lastLoginAt,
			updated_at = :updatedAt
		WHERE id = :userId`,
		args: input
	});
}
