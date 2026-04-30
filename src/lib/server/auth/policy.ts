import { findModuleByPath } from '$lib/auth/modules';
import type { Role } from '$lib/auth/types';

export function isPublicPath(pathname: string) {
	return pathname === '/';
}

export function getAllowedRolesForPath(pathname: string): Role[] | null {
	const module = findModuleByPath(pathname);
	return module ? module.allowedRoles : null;
}
