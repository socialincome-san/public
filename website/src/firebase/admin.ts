import { AuthAdmin } from '@socialincome/shared/src/firebase/admin/AuthAdmin';
import { FirestoreAdmin } from '@socialincome/shared/src/firebase/admin/FirestoreAdmin';
import { StorageAdmin } from '@socialincome/shared/src/firebase/admin/StorageAdmin';
import { getOrInitializeFirebaseAdmin } from '@socialincome/shared/src/firebase/admin/app';
import { credential } from 'firebase-admin';

// Escape line breaks from the environment variable so that JSON.parse() can parse it.
const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.replaceAll('\n', '\\n')
const databaseURL = process.env.FIREBASE_DATABASE_URL

export const app = getOrInitializeFirebaseAdmin(
	// Important: The content of FIREBASE_SERVICE_ACCOUNT_JSON should not contain any line breaks
	serviceAccountJSON && databaseURL
		? {
				credential: credential.cert(JSON.parse(serviceAccountJSON)),
				databaseURL: databaseURL
		  }
		: undefined,
);
export const authAdmin = new AuthAdmin(app);
export const firestoreAdmin = new FirestoreAdmin(app);
export const storageAdmin = new StorageAdmin(app);
