import { FirebaseOptions } from '@firebase/app';
import { getApp } from 'firebase/app';
import { browserSessionPersistence, connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

export function getFirebaseConfig(): FirebaseOptions | undefined {
	return import.meta.env.MODE === 'development'
		? {
				apiKey: import.meta.env.VITE_ADMIN_FB_API_KEY,
				authDomain: import.meta.env.VITE_ADMIN_FB_AUTH_DOMAIN,
				projectId: import.meta.env.VITE_ADMIN_FB_PROJECT_ID,
		  }
		: undefined; // In staging/production, config is loaded from the environment variables set by Firebase Hosting
}

export async function onFirebaseInit() {
	const auth = getAuth();
	if (import.meta.env.VITE_PLAYWRIGHT_TESTS === 'true') {
		console.log('Running Playwright tests, using session storage for persistence');
		await auth.setPersistence(browserSessionPersistence);
	}
	if (import.meta.env.VITE_ADMIN_FB_AUTH_EMULATOR_URL) {
		connectAuthEmulator(auth, import.meta.env.VITE_ADMIN_FB_AUTH_EMULATOR_URL, { disableWarnings: true });
		console.log('Using auth emulator');
	} else {
		console.log('Using production auth');
	}
	if (import.meta.env.VITE_ADMIN_FB_FIRESTORE_EMULATOR_HOST && import.meta.env.VITE_ADMIN_FB_FIRESTORE_EMULATOR_PORT) {
		connectFirestoreEmulator(
			getFirestore(),
			import.meta.env.VITE_ADMIN_FB_FIRESTORE_EMULATOR_HOST,
			+import.meta.env.VITE_ADMIN_FB_FIRESTORE_EMULATOR_PORT
		);
		console.log('Using firestore emulator');
	} else {
		console.log('Using production firestore');
	}
	if (import.meta.env.VITE_ADMIN_FB_STORAGE_EMULATOR_HOST && import.meta.env.VITE_ADMIN_FB_STORAGE_EMULATOR_PORT) {
		connectStorageEmulator(
			getStorage(),
			import.meta.env.VITE_ADMIN_FB_STORAGE_EMULATOR_HOST,
			+import.meta.env.VITE_ADMIN_FB_STORAGE_EMULATOR_PORT
		);
		console.log('Using storage emulator');
	} else {
		console.log('Using production storage');
	}
	if (import.meta.env.VITE_FB_FUNCTIONS_EMULATOR_HOST && import.meta.env.VITE_FB_FUNCTIONS_EMULATOR_PORT) {
		const app = getApp();
		const functions = getFunctions(app);
		connectFunctionsEmulator(
			functions,
			import.meta.env.VITE_FB_FUNCTIONS_EMULATOR_HOST,
			+import.meta.env.VITE_FB_FUNCTIONS_EMULATOR_PORT
		);
		console.log('Using functions emulator');
	} else {
		console.log('Using production functions');
	}
}
