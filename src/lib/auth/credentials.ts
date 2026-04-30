import type { LoginFieldErrors } from '$lib/auth/types';

export const LOGIN_PIN_LENGTH = 6;
export const LOGIN_MOBILE_INPUT_MAX_LENGTH = 12;

export function sanitizeMobileNumberInput(value: string) {
	return value.replace(/\D/g, '').slice(0, LOGIN_MOBILE_INPUT_MAX_LENGTH);
}

export function sanitizePinInput(value: string) {
	return value.replace(/\D/g, '').slice(0, LOGIN_PIN_LENGTH);
}

export function normalizeMobileNumberToE164(value: string) {
	const digits = sanitizeMobileNumberInput(value);

	if (/^09\d{9}$/.test(digits)) {
		return `+63${digits.slice(1)}`;
	}

	if (/^639\d{9}$/.test(digits)) {
		return `+${digits}`;
	}

	return null;
}

export function isPinFormatValid(value: string) {
	return /^\d{6}$/.test(value);
}

export function validateLoginPayload(
	payload: unknown
):
	| { ok: true; mobileNumber: string; pin: string }
	| { ok: false; message: string; fieldErrors: LoginFieldErrors } {
	const fieldErrors: LoginFieldErrors = {};
	const record = typeof payload === 'object' && payload !== null ? payload : {};
	const rawMobileNumber =
		typeof Reflect.get(record, 'mobileNumber') === 'string'
			? String(Reflect.get(record, 'mobileNumber'))
			: '';
	const rawPin =
		typeof Reflect.get(record, 'pin') === 'string' ? String(Reflect.get(record, 'pin')) : '';

	const mobileNumber = normalizeMobileNumberToE164(rawMobileNumber);
	const pin = sanitizePinInput(rawPin);

	if (!rawMobileNumber.trim()) {
		fieldErrors.mobileNumber = 'Ilagay ang mobile number.';
	} else if (!mobileNumber) {
		fieldErrors.mobileNumber = 'Gamitin ang 09XXXXXXXXX o 639XXXXXXXXX.';
	}

	if (!rawPin.trim()) {
		fieldErrors.pin = 'Ilagay ang 6-digit PIN.';
	} else if (!isPinFormatValid(pin)) {
		fieldErrors.pin = 'Kailangan ang buong 6-digit PIN.';
	}

	if (fieldErrors.mobileNumber || fieldErrors.pin) {
		return {
			ok: false,
			message: 'Paki-check ang mobile number at PIN.',
			fieldErrors
		};
	}

	return {
		ok: true,
		mobileNumber: mobileNumber!,
		pin
	};
}
