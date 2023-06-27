import { getApps, initializeApp } from 'firebase-admin/app';
import { App, AppOptions } from 'firebase-admin/lib/app/core';

/**
 * Function that returns a firebase-admin app instance and initializes it if it doesn't exist yet.
 * @param options: If no options are passed, the package loads the options from env variables, see: https://firebase.google.com/docs/admin/setup#initialize-sdk
 * 								 or .env.development file.
 */
export const getOrInitializeFirebaseAdmin = (options?: AppOptions): App => {
	const apps = getApps();
	if (apps.length > 0) {
		return apps.at(0)!;
	} else {
		return initializeApp(options);
	}
};
