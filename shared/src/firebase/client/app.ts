import { FirebaseApp, FirebaseOptions, getApps, initializeApp } from 'firebase/app';

export const getOrInitializeFirebaseClientApp = (options?: FirebaseOptions): FirebaseApp => {
	const apps = getApps();
	if (apps.length > 0) {
		return apps.at(0)!;
	} else {
		return options ? initializeApp(options) : initializeApp();
	}
};
