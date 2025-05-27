import { getOrInitializeFirebaseAdmin } from '@socialincome/shared/src/firebase/admin/app';
import { AuthAdmin } from '@socialincome/shared/src/firebase/admin/AuthAdmin';
import { FirestoreAdmin } from '@socialincome/shared/src/firebase/admin/FirestoreAdmin';
import { StorageAdmin } from '@socialincome/shared/src/firebase/admin/StorageAdmin';
import { credential } from 'firebase-admin';

const encodedServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const databaseURL = process.env.FIREBASE_DATABASE_URL;

console.log('🔍 Initializing Firebase Admin...');
console.log(`📡 FIREBASE_DATABASE_URL set: ${!!databaseURL}`);
console.log(`🔐 FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 set: ${!!encodedServiceAccount}`);

let credentials;

if (encodedServiceAccount && databaseURL) {
	try {
		const jsonString = Buffer.from(encodedServiceAccount, 'base64').toString('utf-8');

		// Optionally log the first few characters (safe for debug, not production)
		console.log(`✅ Decoded service account JSON (length: ${jsonString.length})`);

		const parsed = JSON.parse(jsonString);

		console.log(`🧾 Service account client_email: ${parsed.client_email}`);
		console.log(`🔑 Key ID: ${parsed.private_key_id}`);

		credentials = {
			credential: credential.cert(parsed),
			databaseURL,
		};
	} catch (error) {
		console.error('❌ Failed to decode or parse FIREBASE_SERVICE_ACCOUNT_JSON_BASE64');
		console.error(error);
	}
} else {
	console.warn(
		'⚠️ Missing FIREBASE_DATABASE_URL or FIREBASE_SERVICE_ACCOUNT_JSON_BASE64. Firebase Admin not initialized.',
	);
}

export const app = getOrInitializeFirebaseAdmin(credentials);
export const authAdmin = new AuthAdmin(app);
export const firestoreAdmin = new FirestoreAdmin(app);
export const storageAdmin = new StorageAdmin(app);
