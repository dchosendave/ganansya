import { json, type RequestHandler } from '@sveltejs/kit';

import { validateLoginPayload } from '$lib/auth/credentials';
import { setAuthCookie } from '$lib/server/auth/cookies';
import {
	getRequestIpAddress,
	getRequestUserAgent,
	isSameOriginRequest
} from '$lib/server/auth/http';
import { REQUEST_REJECTED_MESSAGE } from '$lib/server/auth/messages';
import { authenticateLogin } from '$lib/server/auth/service';
import { signAuthToken } from '$lib/server/auth/jwt';

export const POST: RequestHandler = async (event) => {
	if (!isSameOriginRequest(event)) {
		return json(
			{
				ok: false,
				message: REQUEST_REJECTED_MESSAGE
			},
			{ status: 403 }
		);
	}

	let payload: unknown;

	try {
		payload = await event.request.json();
	} catch {
		return json(
			{
				ok: false,
				message: 'Invalid request body.',
				fieldErrors: {
					form: 'Paki-ulit ang login request.'
				}
			},
			{ status: 400 }
		);
	}

	const validationResult = validateLoginPayload(payload);

	if (!validationResult.ok) {
		return json(
			{
				ok: false,
				message: validationResult.message,
				fieldErrors: validationResult.fieldErrors
			},
			{ status: 400 }
		);
	}

	const authenticationResult = await authenticateLogin(
		validationResult.mobileNumber,
		validationResult.pin,
		{
			ipAddress: getRequestIpAddress(event),
			userAgent: getRequestUserAgent(event)
		}
	);

	if (!authenticationResult.ok) {
		return json(
			{
				ok: false,
				message: authenticationResult.message
			},
			{ status: authenticationResult.status }
		);
	}

	const token = await signAuthToken({
		userId: authenticationResult.user.id,
		role: authenticationResult.user.role,
		mobileNumber: authenticationResult.user.mobileNumber,
		authVersion: authenticationResult.user.authVersion
	});

	setAuthCookie(event.cookies, token);

	return json({
		ok: true,
		redirectTo: '/home'
	});
};
