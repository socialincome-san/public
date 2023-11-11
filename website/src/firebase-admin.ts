import { getOrInitializeFirebaseAdmin } from '@socialincome/shared/src/firebase/admin/app';
import { AuthAdmin } from '@socialincome/shared/src/firebase/admin/AuthAdmin';
import { FirestoreAdmin } from '@socialincome/shared/src/firebase/admin/FirestoreAdmin';
import { StorageAdmin } from '@socialincome/shared/src/firebase/admin/StorageAdmin';
import { User, USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { credential } from 'firebase-admin';

// FIREBASE_SERVICE_ACCOUNT_JSON should only be a single line where the content of private_key contains \n characters.
// Escape line breaks from the environment variable so that JSON.parse() can parse the string.
const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.replaceAll('\n', '\\n');
const databaseURL = process.env.FIREBASE_DATABASE_URL;

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

export const getUserDocFromAuthToken = async (token: string | undefined) => {
	if (!token) return undefined;
	const decodedToken = await authAdmin.auth.verifyIdToken(token, true);
	return await firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (q) =>
		q.where('authUserId', '==', decodedToken.uid),
	);
};
