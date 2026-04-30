import type { RequestEvent } from '@sveltejs/kit';

export function getRequestIpAddress(event: RequestEvent) {
	const forwardedFor = event.request.headers.get('x-forwarded-for');

	if (forwardedFor) {
		return forwardedFor.split(',')[0]?.trim() || 'unknown';
	}

	const realIp = event.request.headers.get('x-real-ip');

	if (realIp) {
		return realIp.trim();
	}

	try {
		return event.getClientAddress();
	} catch {
		return 'unknown';
	}
}

export function getRequestUserAgent(event: RequestEvent) {
	return event.request.headers.get('user-agent')?.trim() || 'unknown';
}

export function isSameOriginRequest(event: RequestEvent) {
	const origin = event.request.headers.get('origin');
	return Boolean(origin && origin === event.url.origin);
}
