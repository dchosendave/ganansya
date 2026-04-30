// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('$lib/auth/types').CurrentUser | null;
			authState: 'missing' | 'valid' | 'expired' | 'invalid';
		}
		interface PageData {
			currentUser: import('$lib/auth/types').CurrentUser | null;
			flashMessage: import('$lib/auth/types').FlashMessage | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
