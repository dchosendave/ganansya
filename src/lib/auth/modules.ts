import type { AppModule, Role } from '$lib/auth/types';

export const APP_MODULES: AppModule[] = [
	{
		id: 'dashboard',
		label: 'Home',
		description: 'Balik sa pangunahing dashboard.',
		href: '/home',
		allowedRoles: ['operator', 'owner'],
		matchers: ['/home'],
		showOnHome: false
	},
	{
		id: 'reconciliation',
		label: 'Reconciliation',
		description: 'Ihambing ang actual cash at GCash sa expected totals.',
		href: '/reconciliation',
		allowedRoles: ['operator', 'owner'],
		matchers: ['/reconciliation'],
		showOnHome: true
	},
	{
		id: 'reports',
		label: 'Reports',
		description: 'Silipin ang profit, volume, at summary ng araw o buwan.',
		href: '/reports',
		allowedRoles: ['owner'],
		matchers: ['/reports'],
		showOnHome: true
	},
	{
		id: 'admin-root',
		label: 'Admin',
		description: 'Owner-only admin area.',
		href: '/admin',
		allowedRoles: ['owner'],
		matchers: ['/admin/*'],
		showOnHome: false
	},
	{
		id: 'admin-users',
		label: 'Users',
		description: 'Tingnan ang listahan ng active at inactive accounts.',
		href: '/admin/users',
		allowedRoles: ['owner'],
		matchers: ['/admin/users'],
		showOnHome: true
	},
	{
		id: 'admin-user-roles',
		label: 'User Roles',
		description: 'I-manage kung sino ang operator at owner.',
		href: '/admin/user-roles',
		allowedRoles: ['owner'],
		matchers: ['/admin/user-roles'],
		showOnHome: true
	},
	{
		id: 'admin-pricing',
		label: 'Pricing',
		description: 'Ayusin ang fee tiers at pricing rules ng tindahan.',
		href: '/admin/pricing',
		allowedRoles: ['owner'],
		matchers: ['/admin/pricing'],
		showOnHome: true
	},
	{
		id: 'admin-audit',
		label: 'Audit',
		description: 'Suriin ang auth at admin activity history.',
		href: '/admin/audit',
		allowedRoles: ['owner'],
		matchers: ['/admin/audit'],
		showOnHome: true
	}
];

export function isRoleAllowed(role: Role, allowedRoles: Role[]) {
	return allowedRoles.includes(role);
}

export function getHomeModulesForRole(role: Role) {
	return APP_MODULES.filter(
		(module) => module.showOnHome && isRoleAllowed(role, module.allowedRoles)
	);
}

export function findModuleByPath(pathname: string) {
	return APP_MODULES.find((module) =>
		module.matchers.some((matcher) =>
			matcher.endsWith('/*')
				? pathname === matcher.slice(0, -2) || pathname.startsWith(`${matcher.slice(0, -1)}`)
				: pathname === matcher
		)
	);
}
