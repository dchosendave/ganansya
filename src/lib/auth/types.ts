export type Role = 'operator' | 'owner';

export type CurrentUser = {
	id: number;
	displayName: string;
	mobileNumber: string;
	role: Role;
};

export type FlashTone = 'info' | 'success' | 'error';

export type FlashMessage = {
	tone: FlashTone;
	text: string;
};

export type LoginFieldErrors = {
	mobileNumber?: string;
	pin?: string;
	form?: string;
};

export type AuthApiSuccess = {
	ok: true;
	redirectTo: string;
};

export type AuthApiFailure = {
	ok: false;
	message: string;
	fieldErrors?: LoginFieldErrors;
};

export type AuthApiResponse = AuthApiSuccess | AuthApiFailure;

export type AppModule = {
	id: string;
	label: string;
	description: string;
	href: string;
	allowedRoles: Role[];
	matchers: string[];
	showOnHome: boolean;
};
