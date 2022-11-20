import { getApps, initializeApp } from 'firebase-admin/app';
import { App } from 'firebase-admin/lib/app/core';

export const getOrInitializeApp = (): App => {
	const apps = getApps();
	if (apps.length > 0) {
		console.log('Reusing existing app.');
		return apps.at(0)!;
	} else {
		console.log('Initializing app.');
		return initializeApp();
	}
};
