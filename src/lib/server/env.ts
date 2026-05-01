import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DATABASE_URL, DATABASE_AUTH_TOKEN, AUTH_JWT_SECRET } from '$env/static/private';

/** @param {string | undefined} value */
/** @param {string} name */
function getRequiredEnv(value: string | undefined, name: string) {
	if (!value?.trim()) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value.trim();
}

/** @param {string} value */
function normalizeDatabaseUrl(value: string) {
	if (!value.startsWith('file:') || value.startsWith('file://')) {
		return value;
	}

	const relativePath = value.slice('file:'.length);
	return pathToFileURL(path.resolve(process.cwd(), relativePath)).toString();
}

export function getDatabaseConfig() {
	const url = normalizeDatabaseUrl(
		getRequiredEnv(DATABASE_URL, 'DATABASE_URL')
	);

	const authToken = DATABASE_AUTH_TOKEN?.trim() || undefined;

	return { url, authToken };
}

export function getAuthJwtSecret() {
	const secret = getRequiredEnv(AUTH_JWT_SECRET, 'AUTH_JWT_SECRET');

	if (secret.length < 32) {
		throw new Error('AUTH_JWT_SECRET must be at least 32 characters long.');
	}

	return secret;
}