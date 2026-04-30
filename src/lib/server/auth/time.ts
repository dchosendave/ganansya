export function nowAsIsoString() {
	return new Date().toISOString();
}

export function addMinutesToIsoString(isoString: string, minutes: number) {
	return new Date(Date.parse(isoString) + minutes * 60 * 1000).toISOString();
}

export function subtractMinutesFromIsoString(isoString: string, minutes: number) {
	return new Date(Date.parse(isoString) - minutes * 60 * 1000).toISOString();
}

export function isIsoStringInFuture(isoString: string | null, nowIsoString: string) {
	return Boolean(isoString && isoString > nowIsoString);
}
