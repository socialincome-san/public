import { getOrInitializeFirebaseAdmin } from '@socialincome/shared/src/firebase/admin/app';
import { AuthAdmin } from '@socialincome/shared/src/firebase/admin/AuthAdmin';
import { credential } from 'firebase-admin';
import { UpdateRequest, UserRecord } from 'firebase-admin/auth';
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
	private authAdmin = new AuthAdmin(getOrInitializeFirebaseAdmin(credentials));

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

			const userRecord = await this.authAdmin.auth.createUser({
				phoneNumber,
			});
			return this.resultOk(userRecord);
		} catch (error) {
			console.error('Error creating user by phone number:', error);
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

			const updatedUser = await this.authAdmin.auth.updateUser(existingUserResult.data.uid, {
				phoneNumber: newPhoneNumber,
			});
			return this.resultOk(updatedUser);
		} catch (error) {
			console.error('Error fetching user by phone number:', error);
			return this.resultFail('Could not update auth user by phone number');
		}
	}

	async getByPhoneNumber(phoneNumber: string): Promise<ServiceResult<UserRecord | null>> {
		try {
			const userRecord = await this.authAdmin.auth.getUserByPhoneNumber(phoneNumber);
			return this.resultOk(userRecord);
		} catch (error: any) {
			if (error?.code === 'auth/user-not-found') {
				return this.resultOk(null);
			}
			console.error('Error getting user by phone number:', error);
			return this.resultFail('Auth user not found by phone number');
		}
	}

	async updateByUid(uid: string, updates: UpdateRequest): Promise<ServiceResult<UserRecord>> {
		try {
			const existingUser = await this.authAdmin.auth.getUser(uid);
			if (!existingUser) {
				return this.resultFail('Auth user not found');
			}
			const updatedUser = await this.authAdmin.auth.updateUser(uid, updates);
			return this.resultOk(updatedUser);
		} catch (error) {
			console.error(`Error updating user by UID ${uid}:`, error);
			return this.resultFail('Could not update auth user by UID');
		}
	}

	async createSurveyUser(email: string, password: string): Promise<ServiceResult<UserRecord>> {
		try {
			const userRecord = await this.authAdmin.auth.createUser({
				email,
				password,
				emailVerified: true,
			});
			return this.resultOk(userRecord);
		} catch (error) {
			console.error('Error creating survey user:', error);
			return this.resultFail('Could not create survey auth user');
		}
	}

	async createCustomToken(uid: string): Promise<ServiceResult<string>> {
		try {
			const token = await this.authAdmin.auth.createCustomToken(uid);
			return this.resultOk(token);
		} catch (error) {
			console.error('Error creating custom token:', error);
			return this.resultFail('Could not create custom token');
		}
	}
}
