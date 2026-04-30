import { getDatabase } from './_helpers.mjs';

const statements = [
	`CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		display_name TEXT NOT NULL,
		mobile_number TEXT NOT NULL UNIQUE,
		pin_hash TEXT NOT NULL,
		role TEXT NOT NULL CHECK (role IN ('operator', 'owner')),
		is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
		auth_version INTEGER NOT NULL DEFAULT 1 CHECK (auth_version >= 1),
		failed_login_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_login_attempts >= 0),
		failed_login_window_started_at TEXT,
		locked_until TEXT,
		last_login_at TEXT,
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL
	)`,
	`CREATE TABLE IF NOT EXISTS auth_audit (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
		actor_user_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
		mobile_number_attempted TEXT,
		event_type TEXT NOT NULL,
		event_reason TEXT,
		ip_address TEXT NOT NULL,
		user_agent TEXT NOT NULL,
		created_at TEXT NOT NULL
	)`,
	`CREATE INDEX IF NOT EXISTS idx_auth_audit_user_created_at
		ON auth_audit (user_id, created_at DESC)`,
	`CREATE INDEX IF NOT EXISTS idx_auth_audit_ip_created_at
		ON auth_audit (ip_address, created_at DESC)`,
	`CREATE INDEX IF NOT EXISTS idx_auth_audit_mobile_created_at
		ON auth_audit (mobile_number_attempted, created_at DESC)`,
	`CREATE INDEX IF NOT EXISTS idx_auth_audit_ip_mobile_created_at
		ON auth_audit (ip_address, mobile_number_attempted, created_at DESC)`,
	`CREATE INDEX IF NOT EXISTS idx_auth_audit_event_created_at
		ON auth_audit (event_type, created_at DESC)`
];

for (const statement of statements) {
	await getDatabase().execute(statement);
}

console.log('Auth database initialized.');
