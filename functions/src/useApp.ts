import { getApps, initializeApp } from 'firebase-admin/app';
import { App } from 'firebase-admin/lib/app/core';
import * as functions from 'firebase-functions';

export const getOrInitializeApp = (): App => {
	const apps = getApps();
	if (apps.length > 0) {
		functions.logger.info('Reusing existing app.');
		return apps.at(0)!;
	} else {
		functions.logger.info('Initializing app.');
		return initializeApp();
	}
};
