import { FirebaseOptions } from 'firebase/app';
import { browserSessionPersistence } from 'firebase/auth';
import { initializeFirebaseClient } from '../../shared/src/firebase/client/init';

export const firebaseConfig: FirebaseOptions | undefined =
	import.meta.env.MODE === 'development'
		? {
				apiKey: import.meta.env.VITE_ADMIN_FB_API_KEY,
				authDomain: import.meta.env.VITE_ADMIN_FB_AUTH_DOMAIN,
				projectId: import.meta.env.VITE_ADMIN_FB_PROJECT_ID,
			}
		: undefined; // In staging/production, config is loaded from the environment variables set by Firebase Hosting

export async function onFirebaseInit() {
	const { auth } = initializeFirebaseClient({
		firebaseConfig: firebaseConfig,
		authEmulatorUrl: import.meta.env.VITE_ADMIN_FB_AUTH_EMULATOR_URL,
		firestoreEmulatorHost: import.meta.env.VITE_ADMIN_FB_FIRESTORE_EMULATOR_HOST,
		firestoreEmulatorPort: Number(import.meta.env.VITE_ADMIN_FB_FIRESTORE_EMULATOR_PORT),
		storageEmulatorHost: import.meta.env.VITE_ADMIN_FB_STORAGE_EMULATOR_HOST,
		storageEmulatorPort: Number(import.meta.env.VITE_ADMIN_FB_STORAGE_EMULATOR_PORT),
		functionsEmulatorHost: import.meta.env.VITE_FB_FUNCTIONS_EMULATOR_HOST,
		functionsEmulatorPort: Number(import.meta.env.VITE_FB_FUNCTIONS_EMULATOR_PORT),
	});

	if (import.meta.env.VITE_PLAYWRIGHT_TESTS === 'true') {
		console.log('Running Playwright tests, using session storage for persistence');
		await auth.setPersistence(browserSessionPersistence);
	}
}
