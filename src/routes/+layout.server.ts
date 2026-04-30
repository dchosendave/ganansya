import type { LayoutServerLoad } from './$types';

import { consumeFlashMessage } from '$lib/server/auth/cookies';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	return {
		currentUser: locals.user,
		flashMessage: consumeFlashMessage(cookies)
	};
};
