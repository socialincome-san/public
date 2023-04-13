import { FirebaseApp } from '@firebase/app';
import { initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, Firestore, getFirestore } from 'firebase/firestore/lite';
import { connectFunctionsEmulator, Functions, getFunctions } from 'firebase/functions';

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
	databaseURL: process.env.NEXT_PUBLIC_FB_DATABASE_URL,
	projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
	appId: process.env.NEXT_PUBLIC_FB_APP_ID,
};

let firebaseClient: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let functions: Functions;

/**
 * Initializes public clients. In contrast to the admin clients, this can be used directly from the client
 * since the security rules are applied.
 */
export const getFirebaseClients = () => {
	if (!firebaseClient) {
		firebaseClient = initializeApp(firebaseConfig);
	}
	if (!auth) {
		auth = getAuth(firebaseClient);
		if (process.env.NEXT_PUBLIC_FB_AUTH_EMULATOR_URL) {
			connectAuthEmulator(auth, process.env.NEXT_PUBLIC_FB_AUTH_EMULATOR_URL, { disableWarnings: true });
			console.log('Using auth emulator');
		} else {
			console.log('Using production auth');
		}
	}
	if (!firestore) {
		firestore = getFirestore(firebaseClient);
		if (process.env.NEXT_PUBLIC_FB_FIRESTORE_EMULATOR_HOST && process.env.NEXT_PUBLIC_FB_FIRESTORE_EMULATOR_PORT) {
			connectFirestoreEmulator(
				firestore,
				process.env.NEXT_PUBLIC_FB_FIRESTORE_EMULATOR_HOST,
				Number(process.env.NEXT_PUBLIC_FB_FIRESTORE_EMULATOR_PORT)
			);
			console.log('Using firestore emulator');
		} else {
			console.log('Using production firestore');
		}
	}
	if (!functions) {
		functions = getFunctions(firebaseClient);
		if (process.env.NEXT_PUBLIC_FB_FUNCTIONS_EMULATOR_HOST && process.env.NEXT_PUBLIC_FB_FUNCTIONS_EMULATOR_PORT) {
			connectFunctionsEmulator(
				functions,
				process.env.NEXT_PUBLIC_FB_FUNCTIONS_EMULATOR_HOST,
				Number(process.env.NEXT_PUBLIC_FB_FUNCTIONS_EMULATOR_PORT)
			);
			console.log('Using functions emulator');
		} else {
			console.log('Using production functions');
		}
	}
	return { firebaseClient, auth, firestore, functions };
};
