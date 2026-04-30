import { json, redirect, type Handle } from '@sveltejs/kit';

import { clearAuthCookie, setFlashMessage } from '$lib/server/auth/cookies';
import {
	ACCESS_DENIED_FLASH,
	LOGIN_REQUIRED_FLASH,
	SESSION_EXPIRED_FLASH
} from '$lib/server/auth/messages';
import { getAllowedRolesForPath, isPublicPath } from '$lib/server/auth/policy';
import { resolveSessionFromCookie } from '$lib/server/auth/session';
import { AUTH_COOKIE_NAME } from '$lib/server/auth/settings';

export const handle: Handle = async ({ event, resolve }) => {
	const session = await resolveSessionFromCookie(event.cookies.get(AUTH_COOKIE_NAME));

	event.locals.user = session.user;
	event.locals.authState = session.state;

	if (session.state === 'expired' || session.state === 'invalid') {
		clearAuthCookie(event.cookies);
	}

	const pathname = event.url.pathname;

	if (pathname === '/' && session.state === 'valid') {
		throw redirect(303, '/home');
	}

	const allowedRoles = getAllowedRolesForPath(pathname);

	if (!allowedRoles) {
		return resolve(event);
	}

	if (!session.user) {
		if (pathname.startsWith('/api/')) {
			return json(
				{
					ok: false,
					message:
						session.state === 'missing' ? LOGIN_REQUIRED_FLASH.text : SESSION_EXPIRED_FLASH.text
				},
				{ status: 401 }
			);
		}

		if (!isPublicPath(pathname)) {
			setFlashMessage(
				event.cookies,
				session.state === 'missing' ? LOGIN_REQUIRED_FLASH : SESSION_EXPIRED_FLASH
			);
			throw redirect(303, '/');
		}
	}

	if (session.user && !allowedRoles.includes(session.user.role)) {
		if (pathname.startsWith('/api/')) {
			return json(
				{
					ok: false,
					message: ACCESS_DENIED_FLASH.text
				},
				{ status: 403 }
			);
		}

		setFlashMessage(event.cookies, ACCESS_DENIED_FLASH);
		throw redirect(303, '/home');
	}

	return resolve(event);
};
