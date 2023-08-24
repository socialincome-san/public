import { initializeFirebaseClient } from '@socialincome/shared/src/firebase/client/init';

/**
 * Initializes public clients. In contrast to the admin clients, this can be used directly from the client
 * since the security rules are applied.
 */
export const { app, auth, firestore, functions, storage } = initializeFirebaseClient({
	firebaseConfig: {
		apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	},
	authEmulatorUrl: process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL,
	firestoreEmulatorHost: process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST,
	firestoreEmulatorPort: Number(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT),
	storageEmulatorHost: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST,
	storageEmulatorPort: Number(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT),
	functionsEmulatorHost: process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST,
	functionsEmulatorPort: Number(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT),
});
