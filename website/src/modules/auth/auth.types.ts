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
