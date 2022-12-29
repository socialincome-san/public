import { credential } from 'firebase-admin';
import { getApps, initializeApp } from 'firebase-admin/app';
import { App } from 'firebase-admin/lib/app/core';

export const getOrInitializeApp = (): App => {
	const apps = getApps();
	if (apps.length > 0) {
		console.log('Reusing existing app.');
		return apps.at(0)!;
	} else {
		if (process.env.FIREBASE_CONFIG_PRIVATE_KEY) {
			console.log('Initializing app with provided config.');
			return initializeApp({
				credential: credential.cert({
					projectId: process.env.FIREBASE_CONFIG_PROJECT_ID,
					privateKey: process.env.FIREBASE_CONFIG_PRIVATE_KEY.replace(/\\n/g, '\n'),
					clientEmail: process.env.FIREBASE_CONFIG_CLIENT_EMAIL,
				}),
				databaseURL: process.env.FIREBASE_CONFIG_DATABASE_URL,
			});
		} else {
			console.log('Initializing app with default config.');
			return initializeApp();
		}
	}
};
