import { getOrInitializeFirebaseAdmin } from '@socialincome/shared/src/firebase/admin/app';
import { AuthAdmin } from '@socialincome/shared/src/firebase/admin/AuthAdmin';
import { credential } from 'firebase-admin';

const { FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_DATABASE_URL } = process.env;

// Firebase service account JSON is Base64-encoded to avoid multiline GitHub Secrets issues in Docker builds
const credentials =
	FIREBASE_SERVICE_ACCOUNT_JSON && FIREBASE_DATABASE_URL
		? {
				credential: credential.cert(JSON.parse(Buffer.from(FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8'))),
				databaseURL: FIREBASE_DATABASE_URL,
			}
		: undefined;

export class AuthService {
	private authAdmin = new AuthAdmin(getOrInitializeFirebaseAdmin(credentials));

	async createByPhoneNumber(phoneNumber: string) {
		try {
			const existingUser = await this.getByPhoneNumber(phoneNumber);
			if (existingUser) {
				console.log('User already exists for phone number:', phoneNumber);
				return existingUser;
			}
			return await this.authAdmin.auth.createUser({
				phoneNumber,
			});
		} catch (error) {
			console.error('Error creating user by phone number:', error);
			throw new Error('Could not create auth user by phone number');
		}
	}

	async updateByPhoneNumber(oldPhoneNumber: string, newPhoneNumber: string) {
		try {
			const existingUser = await this.getByPhoneNumber(oldPhoneNumber);
			if (!existingUser) throw new Error('Auth user not found');
			return await this.authAdmin.auth.updateUser(existingUser.uid, {
				phoneNumber: newPhoneNumber,
			});
		} catch (error) {
			console.error('Error fetching user by phone number:', error);
			throw new Error('Could not update auth user by phone number');
		}
	}

	getByPhoneNumber(phoneNumber: string) {
		try {
			return this.authAdmin.auth.getUserByPhoneNumber(phoneNumber);
		} catch (error) {
			console.error('Error getting user by phone number:', error);
			throw new Error('Auth user not found by phone number');
		}
	}
}
