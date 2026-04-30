import type { CurrentUser, Role } from '$lib/auth/types';

export type DatabaseUser = CurrentUser & {
	pinHash: string;
	isActive: boolean;
	authVersion: number;
	failedLoginAttempts: number;
	failedLoginWindowStartedAt: string | null;
	lockedUntil: string | null;
	lastLoginAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type AuditEventInput = {
	userId?: number | null;
	actorUserId?: number | null;
	mobileNumberAttempted?: string | null;
	eventType: string;
	eventReason?: string | null;
	ipAddress: string;
	userAgent: string;
	createdAt: string;
};

export type SessionResolution =
	| { state: 'missing'; user: null; databaseUser: null }
	| { state: 'expired' | 'invalid'; user: null; databaseUser: null }
	| { state: 'valid'; user: CurrentUser; databaseUser: DatabaseUser };

export type AuthTokenClaims = {
	userId: number;
	role: Role;
	mobileNumber: string;
	authVersion: number;
};
