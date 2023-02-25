import { initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, Firestore, getFirestore } from 'firebase/firestore/lite';

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
	databaseURL: process.env.NEXT_PUBLIC_FB_DATABASE_URL,
	projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
	appId: process.env.NEXT_PUBLIC_FB_APP_ID,
};

let auth: Auth;
let firestore: Firestore;

/**
 * Initializes public clients. In constrast to the admin clients, this can be used directly from the client
 * since the security rules are applied.
 */
export const getFirebaseClients = () => {
	if (!auth || !firestore) {
		const firebaseClient = initializeApp(firebaseConfig);
		auth = getAuth(firebaseClient);
		if (process.env.NEXT_PUBLIC_FB_AUTH_EMULATOR_URL) {
			connectAuthEmulator(auth, process.env.NEXT_PUBLIC_FB_AUTH_EMULATOR_URL, { disableWarnings: true });
			console.log('Using auth emulator');
		} else {
			console.log('Using production auth');
		}
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
	return { auth, firestore };
};
