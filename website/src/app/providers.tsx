'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, FirebaseAppProvider, FirestoreProvider, StorageProvider, useFirebaseApp } from 'reactfire';

// These variables are needed so that the emulators are only initialized once. Probably due to the React Strict mode, it
// happens that the emulators get initialized multiple times in the development environment.
let connectAuthEmulatorCalled = false;
let connectFirestoreEmulatorCalled = false;
let connectStorageEmulatorCalled = false;
let connectFunctionsEmulatorCalled = false;

function FirebaseSDKProviders({ children }: PropsWithChildren) {
	const app = useFirebaseApp();
	const auth = getAuth(app);
	const firestore = getFirestore(app);
	const functions = getFunctions(app);
	const storage = getStorage(app);

	const authEmulatorUrl = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;
	const firestoreEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST;
	const firestoreEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT);
	const storageEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST;
	const storageEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT);
	const functionsEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST;
	const functionsEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT);

	if (authEmulatorUrl && !connectAuthEmulatorCalled) {
		console.log('Using auth emulator');
		connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
		connectAuthEmulatorCalled = true;
	}
	if (firestoreEmulatorHost && firestoreEmulatorPort && !connectFirestoreEmulatorCalled) {
		console.log('Using firestore emulator');
		connectFirestoreEmulator(firestore, firestoreEmulatorHost, firestoreEmulatorPort);
		connectFirestoreEmulatorCalled = true;
	}
	if (storageEmulatorHost && storageEmulatorPort && !connectStorageEmulatorCalled) {
		console.log('Using storage emulator');
		connectStorageEmulator(storage, storageEmulatorHost, storageEmulatorPort);
		connectStorageEmulatorCalled = true;
	}
	if (functionsEmulatorHost && functionsEmulatorPort && connectFunctionsEmulatorCalled) {
		console.log('Using functions emulator');
		connectFunctionsEmulator(functions, functionsEmulatorHost, functionsEmulatorPort);
		connectFunctionsEmulatorCalled = true;
	}

	return (
		<AuthProvider sdk={auth}>
			<FirestoreProvider sdk={firestore}>
				<StorageProvider sdk={storage}>{children}</StorageProvider>
			</FirestoreProvider>
		</AuthProvider>
	);
}

export function Providers({ children }: PropsWithChildren) {
	const firebaseConfig = {
		apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	};
	const queryClient = new QueryClient();

	return (
		<FirebaseAppProvider firebaseConfig={firebaseConfig}>
			<FirebaseSDKProviders>
				<QueryClientProvider client={queryClient}>
					<Toaster />
					{children}
				</QueryClientProvider>
			</FirebaseSDKProviders>
		</FirebaseAppProvider>
	);
}
