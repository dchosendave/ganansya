import { json, type RequestHandler } from '@sveltejs/kit';

import { clearAuthCookie, setFlashMessage } from '$lib/server/auth/cookies';
import {
	getRequestIpAddress,
	getRequestUserAgent,
	isSameOriginRequest
} from '$lib/server/auth/http';
import { LOGOUT_SUCCESS_FLASH, REQUEST_REJECTED_MESSAGE } from '$lib/server/auth/messages';
import { insertAuditEvent } from '$lib/server/auth/repository';
import { nowAsIsoString } from '$lib/server/auth/time';

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

	if (event.locals.user) {
		await insertAuditEvent({
			userId: event.locals.user.id,
			mobileNumberAttempted: event.locals.user.mobileNumber,
			eventType: 'logout',
			ipAddress: getRequestIpAddress(event),
			userAgent: getRequestUserAgent(event),
			createdAt: nowAsIsoString()
		});
	}

	clearAuthCookie(event.cookies);
	setFlashMessage(event.cookies, LOGOUT_SUCCESS_FLASH);

	return json({
		ok: true,
		redirectTo: '/'
	});
};
