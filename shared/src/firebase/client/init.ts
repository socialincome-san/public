import { FirebaseOptions } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { DEFAULT_REGION } from '../index';
import { getOrInitializeFirebaseClientApp } from './app';

interface InitializeFirebaseClientProps {
	firebaseConfig?: FirebaseOptions;
	authEmulatorUrl?: string;
	firestoreEmulatorHost?: string;
	firestoreEmulatorPort?: number;
	storageEmulatorHost?: string;
	storageEmulatorPort?: number;
	functionsEmulatorHost?: string;
	functionsEmulatorPort?: number;
}

export const initializeFirebaseClient = (
	{
		firebaseConfig,
		authEmulatorUrl,
		firestoreEmulatorHost,
		firestoreEmulatorPort,
		storageEmulatorHost,
		storageEmulatorPort,
		functionsEmulatorHost,
		functionsEmulatorPort,
	}: InitializeFirebaseClientProps,
) => {
	const app = getOrInitializeFirebaseClientApp(firebaseConfig);
	const auth = getAuth(app);
	const functions = getFunctions(app, DEFAULT_REGION);
	const firestore = getFirestore(app);
	const storage = getStorage(app);

	if (authEmulatorUrl) {
		connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
		console.log('Using auth emulator');
	}
	if (firestoreEmulatorHost && firestoreEmulatorPort) {
		connectFirestoreEmulator(firestore, firestoreEmulatorHost, firestoreEmulatorPort);
		console.log('Using firestore emulator');
	}
	if (storageEmulatorHost && storageEmulatorPort) {
		connectStorageEmulator(storage, storageEmulatorHost, storageEmulatorPort);
		console.log('Using storage emulator');
	}
	if (functionsEmulatorHost && functionsEmulatorPort) {
		connectFunctionsEmulator(functions, functionsEmulatorHost, functionsEmulatorPort);
		console.log('Using functions emulator');
	}

	return { app, auth, firestore, functions, storage };
};
