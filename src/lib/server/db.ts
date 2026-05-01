import { createClient } from '@libsql/client';
import { getDatabaseConfig } from './env.js';

/** @type {ReturnType<typeof createClient> | undefined} */
let client: ReturnType<typeof createClient> | undefined;

export function getDb() {
	if (!client) {
		client = createClient(getDatabaseConfig());
	}

	return client;
}
