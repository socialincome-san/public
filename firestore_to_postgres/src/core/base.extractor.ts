import { getOrInitializeFirebaseAdmin } from '@socialincome/shared/src/firebase/admin/app';
import { FirestoreAdmin } from '@socialincome/shared/src/firebase/admin/FirestoreAdmin';
import { credential } from 'firebase-admin';
import { AppOptions } from 'firebase-admin/app';

export abstract class BaseExtractor<T> {
	protected readonly firestore: FirestoreAdmin;

	constructor() {
		const app = getOrInitializeFirebaseAdmin(this.buildFirebaseOptions());
		this.firestore = new FirestoreAdmin(app);
	}

	private buildFirebaseOptions(): AppOptions {
		const { FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_DATABASE_URL } = process.env;

		if (!FIREBASE_SERVICE_ACCOUNT_JSON || !FIREBASE_DATABASE_URL) {
			throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON and FIREBASE_DATABASE_URL must be set.');
		}

		const decoded = Buffer.from(FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8');
		const serviceAccount = JSON.parse(decoded);

		return {
			credential: credential.cert(serviceAccount),
			databaseURL: FIREBASE_DATABASE_URL,
			projectId: serviceAccount.project_id,
		};
	}

	abstract extract(): Promise<T[]>;
}
