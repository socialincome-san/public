import { initializeApp } from 'firebase-admin/app';
import { App, AppOptions } from 'firebase-admin/lib/app/core';

let app: App | undefined;

export const getOrInitializeApp = (options?: AppOptions): App => {
	if (app === undefined) {
		app = initializeApp(options);
	}
	return app;
};
