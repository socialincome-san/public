import { authAdmin } from '@/lib/firebase/firebase-admin';
import { credential } from 'firebase-admin';
import { DecodedIdToken, UpdateRequest, UserRecord } from 'firebase-admin/auth';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

const { FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_DATABASE_URL } = process.env;

// Firebase service account JSON is Base64-encoded to avoid multiline GitHub Secrets issues in Docker builds
const credentials =
	FIREBASE_SERVICE_ACCOUNT_JSON && FIREBASE_DATABASE_URL
		? {
				credential: credential.cert(JSON.parse(Buffer.from(FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8'))),
				databaseURL: FIREBASE_DATABASE_URL,
			}
		: undefined;

export class FirebaseService extends BaseService {
	async createByPhoneNumber(phoneNumber: string): Promise<ServiceResult<UserRecord>> {
		try {
			const existingUserResult = await this.getByPhoneNumber(phoneNumber);
			if (!existingUserResult.success) {
				return this.resultFail(existingUserResult.error);
			}

			if (existingUserResult.data) {
				console.log('User already exists for phone number:', phoneNumber);
				return this.resultOk(existingUserResult.data);
			}

			const userRecord = await authAdmin.auth.createUser({
				phoneNumber,
			});
			return this.resultOk(userRecord);
		} catch (error) {
			this.logger.error('Error creating user by phone number:', { error });
			return this.resultFail('Could not create auth user by phone number');
		}
	}

	async updateByPhoneNumber(oldPhoneNumber: string, newPhoneNumber: string): Promise<ServiceResult<UserRecord>> {
		try {
			const existingUserResult = await this.getByPhoneNumber(oldPhoneNumber);
			if (!existingUserResult.success) {
				return this.resultFail(existingUserResult.error);
			}

			if (!existingUserResult.data) {
				return this.resultFail('Auth user not found');
			}

			const updatedUser = await authAdmin.auth.updateUser(existingUserResult.data.uid, {
				phoneNumber: newPhoneNumber,
			});
			return this.resultOk(updatedUser);
		} catch (error) {
			this.logger.error('Error updating user by phone number:', { oldPhoneNumber, newPhoneNumber, error });
			return this.resultFail('Could not update auth user by phone number');
		}
	}

	async getByPhoneNumber(phoneNumber: string): Promise<ServiceResult<UserRecord | null>> {
		try {
			const userRecord = await authAdmin.auth.getUserByPhoneNumber(phoneNumber);
			return this.resultOk(userRecord);
		} catch (error: any) {
			if (error?.code === 'auth/user-not-found') {
				return this.resultOk(null);
			}
			this.logger.error('Error getting user by phone number:', { phoneNumber, error });
			return this.resultFail('Auth user not found by phone number');
		}
	}

	async updateByUid(uid: string, updates: UpdateRequest): Promise<ServiceResult<UserRecord>> {
		try {
			const existingUser = await authAdmin.auth.getUser(uid);
			if (!existingUser) {
				return this.resultFail('Auth user not found');
			}
			const updatedUser = await authAdmin.auth.updateUser(uid, updates);
			return this.resultOk(updatedUser);
		} catch (error) {
			this.logger.error(`Error updating user by UID ${uid}:`, { uid, updates, error });
			return this.resultFail('Could not update auth user by UID');
		}
	}

	async createSurveyUser(email: string, password: string): Promise<ServiceResult<UserRecord>> {
		try {
			const userRecord = await authAdmin.auth.createUser({
				email,
				password,
				emailVerified: true,
			});
			return this.resultOk(userRecord);
		} catch (error) {
			this.logger.error('Error creating survey user:', { email, error });
			return this.resultFail('Could not create survey auth user');
		}
	}

	async createCustomToken(uid: string): Promise<ServiceResult<string>> {
		try {
			const token = await authAdmin.auth.createCustomToken(uid);
			return this.resultOk(token);
		} catch (error) {
			this.logger.error('Error creating custom token:', { uid, error });
			return this.resultFail('Could not create custom token');
		}
	}

	async getDecodedTokenFromRequest(request: Request): Promise<ServiceResult<DecodedIdToken>> {
		const header = request.headers.get('authorization');
		if (!header?.startsWith('Bearer ')) {
			return this.resultFail('Missing or invalid authorization header');
		}

		const token = header.slice('Bearer '.length);
		try {
			const decodedToken = await authAdmin.auth.verifyIdToken(token);
			return this.resultOk(decodedToken);
		} catch (error) {
			this.logger.error('Error verifying ID token:', { error });
			return this.resultFail('Invalid or expired token');
		}
	}

	async getByEmail(email: string): Promise<ServiceResult<UserRecord | null>> {
		try {
			const userRecord = await authAdmin.auth.getUserByEmail(email);
			return this.resultOk(userRecord);
		} catch (error: any) {
			if (error?.code === 'auth/user-not-found') {
				return this.resultOk(null);
			}
			return this.resultFail('Could not check existing Firebase Auth user');
		}
	}

	getPhoneFromToken(decodedToken: DecodedIdToken): string | null {
		return decodedToken.phone_number ?? null;
	}

	async getOrCreateUser(userData: { email: string; displayName: string }): Promise<ServiceResult<UserRecord>> {
		try {
			const existingUserResult = await this.getByEmail(userData.email);
			if (!existingUserResult.success) {
				return this.resultFail(existingUserResult.error);
			}

			if (existingUserResult.data) {
				return this.resultOk(existingUserResult.data);
			}

			const userRecord = await authAdmin.auth.createUser({
				email: userData.email,
				displayName: userData.displayName,
			});
			return this.resultOk(userRecord);
		} catch (error) {
			return this.resultFail('Could not get or create Firebase Auth user');
		}
	}

	async verifySessionCookie(cookie: string): Promise<ServiceResult<DecodedIdToken>> {
		try {
			const decoded = await authAdmin.auth.verifySessionCookie(cookie, true);
			return this.resultOk(decoded);
		} catch (error) {
			return this.resultFail('Invalid or expired session cookie');
		}
	}

	async getDecodedSessionFromRequest(request: Request): Promise<ServiceResult<DecodedIdToken>> {
		const cookieHeader = request.headers.get('cookie');
		if (!cookieHeader) {
			return this.resultFail('Missing session cookie');
		}

		const match = cookieHeader.match(/session=([^;]+)/);
		if (!match) {
			return this.resultFail('Missing session cookie');
		}

		const cookie = match[1];
		return this.verifySessionCookie(cookie);
	}
}
