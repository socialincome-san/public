import { authAdmin } from '@/lib/firebase/firebase-admin';
import admin from 'firebase-admin';
import { DecodedIdToken, UpdateRequest, UserRecord } from 'firebase-admin/auth';
import { PrismaClient } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

const { appCheck } = admin;

export class FirebaseAdminService extends BaseService {
	constructor(db: PrismaClient) { super(db); }

	async createByPhoneNumber(phoneNumber: string): Promise<ServiceResult<UserRecord>> {
		try {
			const existingUserResult = await this.getByPhoneNumber(phoneNumber);
			if (!existingUserResult.success) {
				return this.resultFail(existingUserResult.error);
			}

			if (existingUserResult.data) {
				console.log('User already exists for phone number:', phoneNumber);
				return this.resultFail('User already exists for phone number');
			}

			const userRecord = await authAdmin.auth.createUser({
				phoneNumber,
			});
			return this.resultOk(userRecord);
		} catch (error) {
			this.logger.error('Error creating user by phone number:', { error });
			return this.resultFail(`Could not create auth user by phone number: ${JSON.stringify(error)}`);
		}
	}

	async updateByPhoneNumber(oldPhoneNumber: string, newPhoneNumber: string): Promise<ServiceResult<UserRecord>> {
		try {
			const existingUserResult = await this.getByPhoneNumber(oldPhoneNumber);
			if (!existingUserResult.success) {
				return this.resultFail(existingUserResult.error);
			}

			if (!existingUserResult.data) {
				this.logger.warn('Old Firebase user missing, recreating with new phone', {
					oldPhoneNumber,
					newPhoneNumber,
				});

				const created = await authAdmin.auth.createUser({
					phoneNumber: newPhoneNumber,
				});
				return this.resultOk(created);
			}

			const updatedUser = await authAdmin.auth.updateUser(existingUserResult.data.uid, {
				phoneNumber: newPhoneNumber,
			});
			return this.resultOk(updatedUser);
		} catch (error) {
			this.logger.error('Error updating user by phone number:', { oldPhoneNumber, newPhoneNumber, error });
			return this.resultFail(`Could not update auth user by phone number: ${JSON.stringify(error)}`);
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
			return this.resultFail(`Could not update auth user by UID: ${JSON.stringify(error)}`);
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
			return this.resultFail(`Could not create survey auth user: ${JSON.stringify(error)}`);
		}
	}

	async createCustomToken(uid: string): Promise<ServiceResult<string>> {
		try {
			const token = await authAdmin.auth.createCustomToken(uid);
			return this.resultOk(token);
		} catch (error) {
			this.logger.error('Error creating custom token:', { uid, error });
			return this.resultFail(`Could not create custom token: ${JSON.stringify(error)}`);
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
			return this.resultFail(`Invalid or expired token: ${JSON.stringify(error)}`);
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
			return this.resultFail(`Could not get or create Firebase Auth user: ${JSON.stringify(error)}`);
		}
	}

	async verifyAppCheckFromRequest(request: Request): Promise<ServiceResult<boolean>> {
		const token = request.headers.get('X-Firebase-AppCheck');

		if (!token) {
			this.logger.warn('App Check failed: missing token', {
				path: request.url,
				userAgent: request.headers.get('user-agent'),
			});

			return this.resultFail('missing-app-check-token', 401);
		}

		try {
			const decoded = await appCheck().verifyToken(token);

			this.logger.info('App Check passed', {
				appId: decoded.appId,
				path: request.url,
			});

			return this.resultOk(true);
		} catch (error) {
			this.logger.warn('App Check failed: invalid token', {
				path: request.url,
				userAgent: request.headers.get('user-agent'),
				errorMessage: (error as Error)?.message,
			});

			return this.resultFail(`invalid-app-check-token: ${JSON.stringify(error)}`, 401);
		}
	}

	async deleteByPhoneNumberIfExists(phoneNumber: string): Promise<ServiceResult<boolean>> {
		try {
			const existingUserResult = await this.getByPhoneNumber(phoneNumber);

			if (!existingUserResult.success) {
				return this.resultFail(existingUserResult.error);
			}

			if (!existingUserResult.data) {
				return this.resultOk(true);
			}

			await authAdmin.auth.deleteUser(existingUserResult.data.uid);
			return this.resultOk(true);
		} catch (error) {
			this.logger.error('Error deleting auth user by phone number:', {
				phoneNumber,
				error,
			});
			return this.resultFail(`Could not delete auth user by phone number: ${JSON.stringify(error)}`);
		}
	}

	async deleteByEmailIfExists(email: string): Promise<ServiceResult<boolean>> {
		try {
			const existingUserResult = await this.getByEmail(email);

			if (!existingUserResult.success) {
				return this.resultFail(existingUserResult.error);
			}

			if (!existingUserResult.data) {
				return this.resultOk(true);
			}

			await authAdmin.auth.deleteUser(existingUserResult.data.uid);
			return this.resultOk(true);
		} catch (error) {
			this.logger.error('Error deleting auth user by email:', {
				email,
				error,
			});
			return this.resultFail(`Could not delete auth user by email: ${JSON.stringify(error)}`);
		}
	}
}
