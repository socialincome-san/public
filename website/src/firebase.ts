import { FirebaseApp, FirebaseOptions } from '@firebase/app';
import { initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore/lite';
import { Functions, connectFunctionsEmulator, getFunctions } from 'firebase/functions';

export const firebaseConfig: FirebaseOptions = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let functions: Functions;

/**
 * Initializes public clients. In contrast to the admin clients, this can be used directly from the client
 * since the security rules are applied.
 */
export const getFirebaseClients = () => {
	if (!firebaseApp) {
		firebaseApp = initializeApp(firebaseConfig);
	}
	if (!auth) {
		auth = getAuth(firebaseApp);
		if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL) {
			connectAuthEmulator(auth, process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL, { disableWarnings: true });
			console.log('Using auth emulator');
		} else {
			console.log('Using production auth');
		}
	}
	if (!firestore) {
		firestore = getFirestore(firebaseApp);
		if (
			process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST &&
			process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT
		) {
			connectFirestoreEmulator(
				firestore,
				process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST,
				Number(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT)
			);
			console.log('Using firestore emulator');
		} else {
			console.log('Using production firestore');
		}
	}
	if (!functions) {
		functions = getFunctions(firebaseApp);
		if (
			process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST &&
			process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT
		) {
			connectFunctionsEmulator(
				functions,
				process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST,
				Number(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT)
			);
			console.log('Using functions emulator');
		} else {
			console.log('Using production functions');
		}
	}
	return { firebaseApp, auth, firestore, functions };
};
