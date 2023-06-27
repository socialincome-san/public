import { getApps, initializeApp } from 'firebase-admin/app';
import { App, AppOptions } from 'firebase-admin/lib/app/core';

export const getOrInitializeFirebaseAdmin = (options?: AppOptions): App => {
	const apps = getApps();
	if (apps.length > 0) {
		return apps.at(0)!;
	} else {
		console.log('Initializing app.');
		return initializeApp(options);
	}
};
