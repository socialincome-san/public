import { authAdmin } from '@/lib/firebase/firebase-admin';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import type { DecodedIdToken, UpdateRequest, UserRecord } from 'firebase-admin/auth';

export const createFirebaseUserByPhoneNumber = async (phoneNumber: string): Promise<ServiceResult<UserRecord>> => {
	try {
		const existingUserResult = await findFirebaseUserByPhoneNumber(phoneNumber);
		if (!existingUserResult.success) {
			return resultFail(existingUserResult.error);
		}

		if (existingUserResult.data) {
			console.info('User already exists for phone number', { phoneNumber });

			return resultFail('User already exists for phone number');
		}

		return resultOk(await authAdmin.auth.createUser({ phoneNumber }));
	} catch (error) {
		console.error('Error creating user by phone number:', { error });

		return resultFail('Could not create auth user by phone number');
	}
};

export const updateFirebaseUserByPhoneNumber = async (
	oldPhoneNumber: string,
	newPhoneNumber: string,
): Promise<ServiceResult<UserRecord>> => {
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

			return resultOk(await authAdmin.auth.createUser({ phoneNumber: newPhoneNumber }));
		}

		return resultOk(await authAdmin.auth.updateUser(existingUserResult.data.uid, { phoneNumber: newPhoneNumber }));
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
			await authAdmin.auth.deleteUser(existingUserResult.data.uid);
		}

		return resultOk(true);
	} catch (error) {
		console.error('Error deleting user by phone number:', { phoneNumber, error });

		return resultFail('Could not delete auth user by phone number');
	}
};

export const findFirebaseUserByPhoneNumber = async (phoneNumber: string): Promise<ServiceResult<UserRecord | null>> => {
	try {
		return resultOk(await authAdmin.auth.getUserByPhoneNumber(phoneNumber));
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
		return resultOk(await authAdmin.auth.createCustomToken(uid));
	} catch (error) {
		console.error('Error creating Firebase custom token', { uid, error });

		return resultFail('Could not create auth token for user');
	}
};

export const findFirebaseUserByEmail = async (email: string): Promise<ServiceResult<UserRecord | null>> => {
	try {
		return resultOk(await authAdmin.auth.getUserByEmail(email));
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
}): Promise<ServiceResult<UserRecord>> => {
	try {
		return resultOk(
			await authAdmin.auth.createUser({
				email: input.email,
				displayName: input.displayName,
			}),
		);
	} catch (error) {
		console.error('Error creating Firebase user by email', { email: input.email, error });

		return resultFail('Could not create Firebase Auth user');
	}
};

export const createFirebaseSurveyUser = async (email: string, password: string): Promise<ServiceResult<{ uid: string }>> => {
	try {
		const user = await authAdmin.auth.createUser({
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
			await authAdmin.auth.updateUser(existingUserResult.data.uid, {
				email: input.nextEmail,
				password: input.nextPassword,
				emailVerified: true,
			});
		} else {
			await authAdmin.auth.createUser({
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
				await authAdmin.auth.deleteUser(previousUserResult.data.uid);
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

export const updateFirebaseUserByUid = async (uid: string, updates: UpdateRequest): Promise<ServiceResult<UserRecord>> => {
	try {
		await authAdmin.auth.getUser(uid);

		return resultOk(await authAdmin.auth.updateUser(uid, updates));
	} catch (error) {
		console.error('Error updating Firebase user by UID', { uid, updates, error });

		return resultFail('Could not update Firebase Auth user');
	}
};

export const deleteFirebaseUserByUidIfExists = async (uid: string): Promise<ServiceResult<boolean>> => {
	try {
		await authAdmin.auth.deleteUser(uid);

		return resultOk(true);
	} catch (error: unknown) {
		if (isFirebaseUserNotFoundError(error)) {
			return resultOk(true);
		}

		console.error('Error deleting Firebase user by UID', { uid, error });

		return resultFail('Could not delete Firebase Auth user');
	}
};

export const decodeFirebaseTokenFromRequest = async (request: Request): Promise<ServiceResult<DecodedIdToken>> => {
	const header = request.headers.get('authorization');
	if (!header?.startsWith('Bearer ')) {
		return resultFail('Missing or invalid authorization header');
	}

	try {
		return resultOk(await authAdmin.auth.verifyIdToken(header.slice('Bearer '.length)));
	} catch (error) {
		console.error('Error verifying ID token:', { error });

		return resultFail('Invalid or expired token');
	}
};

export const getPhoneNumberFromFirebaseToken = (decodedToken: DecodedIdToken): string | null => {
	return decodedToken.phone_number ?? null;
};

const isFirebaseUserNotFoundError = (error: unknown): boolean =>
	typeof error === 'object' && error !== null && 'code' in error && error.code === 'auth/user-not-found';
