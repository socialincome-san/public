import { type App, type AppOptions, cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { type Auth, getAuth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';

const getOrInitializeFirebaseAdmin = (options?: AppOptions, name?: string): App => {
	const apps = getApps();

	if (name) {
		const existingNamed = apps.find((app) => app.name === name);
		if (existingNamed) {
			return existingNamed;
		}

		return initializeApp(options, name);
	}

	const existingApp = apps.find((app) => app.options.projectId === options?.projectId) ?? apps.at(0);

	return existingApp ?? initializeApp(options);
};

type UploadProps = {
	bucket?: ReturnType<Storage['bucket']>;
	sourceFilePath: string;
	destinationFilePath: string;
};

class StorageAdmin {
	readonly storage: Storage;

	constructor(app?: App) {
		app ??= getOrInitializeFirebaseAdmin();
		this.storage = getStorage(app);
	}

	uploadFile = async ({ bucket, sourceFilePath, destinationFilePath }: UploadProps) => {
		const destinationBucket = bucket ?? this.storage.bucket();

		return await destinationBucket.upload(sourceFilePath, { destination: destinationFilePath });
	};
}

class AuthAdmin {
	readonly auth: Auth;

	constructor(app?: App) {
		app ??= getOrInitializeFirebaseAdmin();
		this.auth = getAuth(app);
	}
}

const { FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_DATABASE_URL } = process.env;

const credentials =
	FIREBASE_SERVICE_ACCOUNT_JSON && FIREBASE_DATABASE_URL
		? {
				credential: cert(
					JSON.parse(Buffer.from(FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8')) as ServiceAccount,
				),
				databaseURL: FIREBASE_DATABASE_URL,
			}
		: undefined;

const app = getOrInitializeFirebaseAdmin(credentials);

export const authAdmin = new AuthAdmin(app);
export const storageAdmin = new StorageAdmin(app);
