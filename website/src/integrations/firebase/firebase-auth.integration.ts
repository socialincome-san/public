import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import type { DecodedIdToken, UserRecord } from 'firebase-admin/auth';
import { getFirebaseAdminAppCheck, getFirebaseAdminAuth } from './firebase-admin.integration';

export const createFirebaseUserByPhoneNumber = async (
	phoneNumber: string,
): Promise<ServiceResult<FirebaseAuthUserRecord>> => {
	try {
		const existingUserResult = await findFirebaseUserByPhoneNumber(phoneNumber);
		if (!existingUserResult.success) {
			return resultFail(existingUserResult.error);
		}

		if (existingUserResult.data) {
			console.info('User already exists for phone number', { phoneNumber });

			return resultFail('User already exists for phone number');
		}

		return resultOk(toFirebaseAuthUserRecord(await getFirebaseAdminAuth().createUser({ phoneNumber })));
	} catch (error) {
		console.error('Error creating user by phone number:', { error });

		return resultFail('Could not create auth user by phone number');
	}
};

export const updateFirebaseUserByPhoneNumber = async (
	oldPhoneNumber: string,
	newPhoneNumber: string,
): Promise<ServiceResult<FirebaseAuthUserRecord>> => {
	try {
		const existingUserResult = await findFirebaseUserByPhoneNumber(oldPhoneNumber);
		if (!existingUserResult.success) {
			return resultFail(existingUserResult.error);
		}

		if (!existingUserResult.data) {
			console.warn('Old Firebase user missing, recreating with new phone', {
				oldPhoneNumber,
				newPhoneNumber,
			});

			return resultOk(toFirebaseAuthUserRecord(await getFirebaseAdminAuth().createUser({ phoneNumber: newPhoneNumber })));
		}

		return resultOk(
			toFirebaseAuthUserRecord(
				await getFirebaseAdminAuth().updateUser(existingUserResult.data.uid, { phoneNumber: newPhoneNumber }),
			),
		);
	} catch (error) {
		console.error('Error updating user by phone number:', { oldPhoneNumber, newPhoneNumber, error });

		return resultFail('Could not update auth user by phone number');
	}
};

export const deleteFirebaseUserByPhoneNumberIfExists = async (phoneNumber: string): Promise<ServiceResult<boolean>> => {
	try {
		const existingUserResult = await findFirebaseUserByPhoneNumber(phoneNumber);
		if (!existingUserResult.success) {
			return resultFail(existingUserResult.error);
		}

		if (existingUserResult.data) {
			await getFirebaseAdminAuth().deleteUser(existingUserResult.data.uid);
		}

		return resultOk(true);
	} catch (error) {
		console.error('Error deleting user by phone number:', { phoneNumber, error });

		return resultFail('Could not delete auth user by phone number');
	}
};

export const findFirebaseUserByPhoneNumber = async (
	phoneNumber: string,
): Promise<ServiceResult<FirebaseAuthUserRecord | null>> => {
	try {
		return resultOk(toFirebaseAuthUserRecord(await getFirebaseAdminAuth().getUserByPhoneNumber(phoneNumber)));
	} catch (error: unknown) {
		if (isFirebaseUserNotFoundError(error)) {
			return resultOk(null);
		}

		console.error('Error getting user by phone number:', { phoneNumber, error });

		return resultFail('Auth user not found by phone number');
	}
};

export const createFirebaseCustomToken = async (uid: string): Promise<ServiceResult<string>> => {
	try {
		return resultOk(await getFirebaseAdminAuth().createCustomToken(uid));
	} catch (error) {
		console.error('Error creating Firebase custom token', { uid, error });

		return resultFail('Could not create auth token for user');
	}
};

export const findFirebaseUserByEmail = async (email: string): Promise<ServiceResult<FirebaseAuthUserRecord | null>> => {
	try {
		return resultOk(toFirebaseAuthUserRecord(await getFirebaseAdminAuth().getUserByEmail(email)));
	} catch (error: unknown) {
		if (isFirebaseUserNotFoundError(error)) {
			return resultOk(null);
		}

		console.error('Error getting Firebase user by email', { email, error });

		return resultFail('Could not check existing Firebase Auth user');
	}
};

export const createFirebaseUserByEmail = async (input: {
	email: string;
	displayName: string;
}): Promise<ServiceResult<FirebaseAuthUserRecord>> => {
	try {
		return resultOk(
			toFirebaseAuthUserRecord(
				await getFirebaseAdminAuth().createUser({
					email: input.email,
					displayName: input.displayName,
				}),
			),
		);
	} catch (error) {
		console.error('Error creating Firebase user by email', { email: input.email, error });

		return resultFail('Could not create Firebase Auth user');
	}
};

export const createFirebaseSurveyUser = async (email: string, password: string): Promise<ServiceResult<{ uid: string }>> => {
	try {
		const user = await getFirebaseAdminAuth().createUser({
			email,
			password,
			emailVerified: true,
		});

		return resultOk({ uid: user.uid });
	} catch (error) {
		console.error('Error creating survey user', { email, error });

		return resultFail('Could not create survey auth user');
	}
};

export const synchronizeFirebaseSurveyUser = async (input: {
	nextEmail: string;
	nextPassword: string;
	previousEmail?: string;
}): Promise<ServiceResult<void>> => {
	try {
		const existingUserResult = await findFirebaseUserByEmail(input.nextEmail);
		if (!existingUserResult.success) {
			return resultFail(existingUserResult.error);
		}

		if (existingUserResult.data) {
			await getFirebaseAdminAuth().updateUser(existingUserResult.data.uid, {
				email: input.nextEmail,
				password: input.nextPassword,
				emailVerified: true,
			});
		} else {
			await getFirebaseAdminAuth().createUser({
				email: input.nextEmail,
				password: input.nextPassword,
				emailVerified: true,
			});
		}

		if (input.previousEmail && input.previousEmail !== input.nextEmail) {
			const previousUserResult = await findFirebaseUserByEmail(input.previousEmail);
			if (!previousUserResult.success) {
				return resultFail(previousUserResult.error);
			}
			if (previousUserResult.data) {
				await getFirebaseAdminAuth().deleteUser(previousUserResult.data.uid);
			}
		}

		return resultOk(undefined);
	} catch (error) {
		console.error('Error synchronizing survey user', {
			nextEmail: input.nextEmail,
			previousEmail: input.previousEmail,
			error,
		});

		return resultFail('Could not synchronize survey auth user');
	}
};

export const updateFirebaseUserByUid = async (
	uid: string,
	updates: FirebaseAuthUserUpdate,
): Promise<ServiceResult<FirebaseAuthUserRecord>> => {
	try {
		await getFirebaseAdminAuth().getUser(uid);

		return resultOk(toFirebaseAuthUserRecord(await getFirebaseAdminAuth().updateUser(uid, updates)));
	} catch (error) {
		console.error('Error updating Firebase user by UID', { uid, updates, error });

		return resultFail('Could not update Firebase Auth user');
	}
};

export const deleteFirebaseUserByUidIfExists = async (uid: string): Promise<ServiceResult<boolean>> => {
	try {
		await getFirebaseAdminAuth().deleteUser(uid);

		return resultOk(true);
	} catch (error: unknown) {
		if (isFirebaseUserNotFoundError(error)) {
			return resultOk(true);
		}

		console.error('Error deleting Firebase user by UID', { uid, error });

		return resultFail('Could not delete Firebase Auth user');
	}
};

export const decodeFirebaseTokenFromRequest = async (request: Request): Promise<ServiceResult<FirebaseDecodedToken>> => {
	const header = request.headers.get('authorization');
	if (!header?.startsWith('Bearer ')) {
		return resultFail('Missing or invalid authorization header');
	}

	try {
		return resultOk(toFirebaseDecodedToken(await getFirebaseAdminAuth().verifyIdToken(header.slice('Bearer '.length))));
	} catch (error) {
		console.error('Error verifying ID token:', { error });

		return resultFail('Invalid or expired token');
	}
};

export const createFirebaseSessionCookie = async (idToken: string, expiresIn: number): Promise<ServiceResult<string>> => {
	try {
		return resultOk(await getFirebaseAdminAuth().createSessionCookie(idToken, { expiresIn }));
	} catch (error) {
		console.error('Could not create Firebase session cookie', { error });

		return resultFail('invalid-token');
	}
};

export const verifyFirebaseSessionCookie = async (sessionCookie: string): Promise<ServiceResult<FirebaseDecodedToken>> => {
	try {
		return resultOk(toFirebaseDecodedToken(await getFirebaseAdminAuth().verifySessionCookie(sessionCookie, true)));
	} catch (error) {
		console.info('Firebase session cookie is invalid or expired', { error });

		return resultFail('Invalid or expired session cookie');
	}
};

export const verifyFirebaseAppCheckToken = async (token: string): Promise<ServiceResult<{ appId: string }>> => {
	try {
		const decodedToken = await getFirebaseAdminAppCheck().verifyToken(token);

		return resultOk({ appId: decodedToken.appId });
	} catch (error) {
		console.warn('Firebase App Check token is invalid', { error });

		return resultFail('invalid-app-check-token', 401);
	}
};

const toFirebaseAuthUserRecord = (user: UserRecord): FirebaseAuthUserRecord => ({
	uid: user.uid,
	email: user.email ?? null,
	emailVerified: user.emailVerified,
	displayName: user.displayName ?? null,
	phoneNumber: user.phoneNumber ?? null,
	disabled: user.disabled,
});

const toFirebaseDecodedToken = (token: DecodedIdToken): FirebaseDecodedToken => ({
	uid: token.uid,
	email: token.email ?? null,
	phoneNumber: token.phone_number ?? null,
});

const isFirebaseUserNotFoundError = (error: unknown): boolean =>
	typeof error === 'object' && error !== null && 'code' in error && error.code === 'auth/user-not-found';

type FirebaseAuthUserRecord = {
	uid: string;
	email: string | null;
	emailVerified: boolean;
	displayName: string | null;
	phoneNumber: string | null;
	disabled: boolean;
};

type FirebaseAuthUserUpdate = {
	email?: string;
	emailVerified?: boolean;
	phoneNumber?: string;
	password?: string;
	displayName?: string;
	disabled?: boolean;
};

type FirebaseDecodedToken = {
	uid: string;
	email: string | null;
	phoneNumber: string | null;
};
