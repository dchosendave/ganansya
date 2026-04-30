import { SignJWT, jwtVerify } from 'jose';

import type { AuthTokenClaims } from '$lib/server/auth/types';
import { AUTH_COOKIE_MAX_AGE_SECONDS } from '$lib/server/auth/settings';
import { getAuthJwtSecret } from '$lib/server/env.js';

const encoder = new TextEncoder();

function getJwtSecretKey() {
	return encoder.encode(getAuthJwtSecret());
}

export async function signAuthToken(claims: AuthTokenClaims) {
	return new SignJWT({
		role: claims.role,
		mobile_number: claims.mobileNumber,
		auth_version: claims.authVersion
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setSubject(String(claims.userId))
		.setIssuedAt()
		.setExpirationTime(`${AUTH_COOKIE_MAX_AGE_SECONDS}s`)
		.sign(getJwtSecretKey());
}

export async function verifyAuthToken(
	token: string
): Promise<{ ok: true; claims: AuthTokenClaims } | { ok: false; reason: 'expired' | 'invalid' }> {
	try {
		const { payload } = await jwtVerify(token, getJwtSecretKey(), {
			algorithms: ['HS256']
		});
		const userId = Number(payload.sub);
		const role = payload.role;
		const mobileNumber = payload.mobile_number;
		const authVersion = Number(payload.auth_version);

		if (
			!Number.isInteger(userId) ||
			(role !== 'operator' && role !== 'owner') ||
			typeof mobileNumber !== 'string' ||
			!Number.isInteger(authVersion)
		) {
			return { ok: false, reason: 'invalid' };
		}

		return {
			ok: true,
			claims: {
				userId,
				role,
				mobileNumber,
				authVersion
			}
		};
	} catch (error) {
		if (error instanceof Error && error.name === 'JWTExpired') {
			return { ok: false, reason: 'expired' };
		}

		return { ok: false, reason: 'invalid' };
	}
}
