import { getOrInitializeFirebaseAdmin } from '@socialincome/shared/src/firebase/admin/app';
import { AuthAdmin } from '@socialincome/shared/src/firebase/admin/AuthAdmin';
import { StorageAdmin } from '@socialincome/shared/src/firebase/admin/StorageAdmin';
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

export const app = getOrInitializeFirebaseAdmin(credentials);
export const authAdmin = new AuthAdmin(app);
export const storageAdmin = new StorageAdmin(app);
