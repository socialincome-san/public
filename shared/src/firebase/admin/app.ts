import { getApps, initializeApp } from 'firebase-admin/app';
import { App, AppOptions } from 'firebase-admin/lib/app/core';

/**
 * This function initializes a firebase-admin app. If no options are passed, they're automatically read from env variables.
 */
export const getOrInitializeFirebaseAdmin = (options?: AppOptions): App => {
	const apps = getApps();
	return apps.find((app) => app.options.projectId === options?.projectId) || apps.at(0) || initializeApp(options);
};
