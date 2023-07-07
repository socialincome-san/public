import { AuthAdmin } from '@socialincome/shared/src/firebase/admin/AuthAdmin';
import { FirestoreAdmin } from '@socialincome/shared/src/firebase/admin/FirestoreAdmin';
import { StorageAdmin } from '@socialincome/shared/src/firebase/admin/StorageAdmin';
import { getOrInitializeFirebaseAdmin } from '@socialincome/shared/src/firebase/admin/app';
import { credential } from 'firebase-admin';

export const app = getOrInitializeFirebaseAdmin(
	// Important: The content of FIREBASE_SERVICE_ACCOUNT_JSON should not contain any line breaks
	process.env.FIREBASE_SERVICE_ACCOUNT_JSON && process.env.FIREBASE_DATABASE_URL
		? {
				credential: credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)),
				databaseURL: process.env.FIREBASE_DATABASE_URL,
		  }
		: undefined,
);
export const authAdmin = new AuthAdmin(app);
export const firestoreAdmin = new FirestoreAdmin(app);
export const storageAdmin = new StorageAdmin(app);
