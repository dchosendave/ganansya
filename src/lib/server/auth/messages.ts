import type { FlashMessage } from '$lib/auth/types';

export const INVALID_CREDENTIALS_MESSAGE = 'Hindi tugma ang mobile number o PIN.';
export const ACCOUNT_LOCKED_MESSAGE = 'Naka-lock muna ang account. Subukan ulit after 15 minutes.';
export const LOGIN_REQUIRED_MESSAGE = 'Login muna para magpatuloy.';
export const SESSION_EXPIRED_MESSAGE = 'Session expired, login ulit.';
export const ACCESS_DENIED_MESSAGE = 'Wala kang access doon.';
export const LOGOUT_SUCCESS_MESSAGE = 'Logged out na. Login ulit kapag handa na.';
export const REQUEST_REJECTED_MESSAGE = 'Request rejected. Subukan ulit mula sa app.';

export const LOGIN_REQUIRED_FLASH: FlashMessage = {
	tone: 'info',
	text: LOGIN_REQUIRED_MESSAGE
};

export const SESSION_EXPIRED_FLASH: FlashMessage = {
	tone: 'error',
	text: SESSION_EXPIRED_MESSAGE
};

export const ACCESS_DENIED_FLASH: FlashMessage = {
	tone: 'error',
	text: ACCESS_DENIED_MESSAGE
};

export const LOGOUT_SUCCESS_FLASH: FlashMessage = {
	tone: 'success',
	text: LOGOUT_SUCCESS_MESSAGE
};
