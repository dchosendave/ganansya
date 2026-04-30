import type { Cookies } from '@sveltejs/kit';

import type { FlashMessage } from '$lib/auth/types';
import {
	AUTH_COOKIE_MAX_AGE_SECONDS,
	AUTH_COOKIE_NAME,
	FLASH_COOKIE_MAX_AGE_SECONDS,
	FLASH_COOKIE_NAME
} from '$lib/server/auth/settings';

function getCookieOptions(maxAge: number) {
	return {
		httpOnly: true,
		path: '/',
		sameSite: 'lax' as const,
		secure: process.env.NODE_ENV === 'production',
		maxAge
	};
}

export function setAuthCookie(cookies: Cookies, token: string) {
	cookies.set(AUTH_COOKIE_NAME, token, getCookieOptions(AUTH_COOKIE_MAX_AGE_SECONDS));
}

export function clearAuthCookie(cookies: Cookies) {
	cookies.delete(AUTH_COOKIE_NAME, getCookieOptions(0));
}

export function setFlashMessage(cookies: Cookies, flashMessage: FlashMessage) {
	cookies.set(
		FLASH_COOKIE_NAME,
		JSON.stringify(flashMessage),
		getCookieOptions(FLASH_COOKIE_MAX_AGE_SECONDS)
	);
}

export function consumeFlashMessage(cookies: Cookies): FlashMessage | null {
	const rawValue = cookies.get(FLASH_COOKIE_NAME);

	if (!rawValue) {
		return null;
	}

	cookies.delete(FLASH_COOKIE_NAME, getCookieOptions(0));

	try {
		const parsed = JSON.parse(rawValue) as Partial<FlashMessage>;

		if (
			(parsed.tone === 'info' || parsed.tone === 'success' || parsed.tone === 'error') &&
			typeof parsed.text === 'string'
		) {
			return {
				tone: parsed.tone,
				text: parsed.text
			};
		}
	} catch {
		return null;
	}

	return null;
}
