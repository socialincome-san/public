import type { ContributorSession } from '@/modules/contributors/contributor.types';
import type { LocalPartnerSession } from '@/modules/local-partners/local-partner.types';
import type { UserSession } from '@/modules/users/user.types';

export const SESSION_COOKIE_NAME = 'session';

export type Session = ContributorSession | LocalPartnerSession | UserSession;

export type VerifyOtpResult = {
	customToken: string;
	isNewUser: boolean;
	uid: string;
};

export type AuthUser = {
	uid: string;
	email: string | null;
	emailVerified: boolean;
	displayName: string | null;
	phoneNumber: string | null;
	disabled: boolean;
};

export type AuthUserUpdate = {
	email?: string;
	emailVerified?: boolean;
	phoneNumber?: string;
	password?: string;
	displayName?: string;
	disabled?: boolean;
};

export type AuthToken = {
	uid: string;
	email: string | null;
	phoneNumber: string | null;
};

export type SessionCookie = {
	value: string;
	maxAge: number;
};
