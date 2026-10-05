import { cert, getApps, initializeApp, type App, type AppOptions } from 'firebase-admin/app';
import { getAppCheck, type AppCheck } from 'firebase-admin/app-check';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';
import { z } from 'zod';

const serviceAccountSchema = z.object({
	projectId: z.string(),
	clientEmail: z.string(),
	privateKey: z.string(),
});

export const getFirebaseAdminAuth = (): Auth => getAuth(getFirebaseAdminApp());

export const getFirebaseAdminStorage = (): Storage => getStorage(getFirebaseAdminApp());

export const getFirebaseAdminAppCheck = (): AppCheck => getAppCheck(getFirebaseAdminApp());

const getFirebaseAdminApp = (): App => {
	const options = getFirebaseAdminOptions();
	const apps = getApps();
	const matchingApp = apps.find((app) => app.options.projectId === options?.projectId) ?? apps.at(0);

	return matchingApp ?? initializeApp(options);
};

const getFirebaseAdminOptions = (): AppOptions | undefined => {
	const { FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_DATABASE_URL } = process.env;
	if (!FIREBASE_SERVICE_ACCOUNT_JSON || !FIREBASE_DATABASE_URL) {
		return undefined;
	}

	try {
		const decodedJson = Buffer.from(FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8');
		const parsedJson: unknown = JSON.parse(decodedJson);
		const serviceAccountResult = serviceAccountSchema.safeParse(parsedJson);
		if (!serviceAccountResult.success) {
			console.error('Firebase service account configuration is invalid');

			return undefined;
		}

		return {
			credential: cert(serviceAccountResult.data),
			databaseURL: FIREBASE_DATABASE_URL,
		};
	} catch (error) {
		console.error('Could not decode Firebase service account configuration', { error });

		return undefined;
	}
};
