import { getOrInitializeFirebaseAdmin } from '@socialincome/shared/src/firebase/admin/app';
import { AuthAdmin } from '@socialincome/shared/src/firebase/admin/AuthAdmin';
import { FirestoreAdmin } from '@socialincome/shared/src/firebase/admin/FirestoreAdmin';
import { StorageAdmin } from '@socialincome/shared/src/firebase/admin/StorageAdmin';
import { credential } from 'firebase-admin';

// FIREBASE_SERVICE_ACCOUNT_JSON should only be a single line where the content of private_key contains \n characters.
// Escape line breaks from the environment variable so that JSON.parse() can parse the string.
const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.replaceAll('\n', '\\n');
const databaseURL = process.env.FIREBASE_DATABASE_URL;

if (!serviceAccountJSON) {
	console.error('❌ FIREBASE_SERVICE_ACCOUNT_JSON is not set');
} else {
	try {
		const parsed = JSON.parse(serviceAccountJSON);
		console.log('✅ Firebase service account loaded');
		console.log(`👤 client_email: ${parsed.client_email}`);
		console.log(`📁 project_id: ${parsed.project_id}`);
	} catch (err) {
		console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', err);
	}
}

if (!databaseURL) {
	console.error('❌ FIREBASE_DATABASE_URL is not set');
} else {
	console.log(`✅ Firebase database URL set to: ${databaseURL}`);
}

export const app = getOrInitializeFirebaseAdmin(
	serviceAccountJSON && databaseURL
		? {
				credential: credential.cert(JSON.parse(serviceAccountJSON)),
				databaseURL: databaseURL,
			}
		: undefined,
);
export const authAdmin = new AuthAdmin(app);
export const firestoreAdmin = new FirestoreAdmin(app);
export const storageAdmin = new StorageAdmin(app);
