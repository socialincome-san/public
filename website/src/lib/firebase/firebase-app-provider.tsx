'use client';

import { FirebaseApp, initializeApp } from 'firebase/app';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { createContext, PropsWithChildren, useRef } from 'react';

const DEFAULT_REGION = 'europe-west6';

export const FirebaseAppContext = createContext<FirebaseApp | undefined>(undefined);
const functionsEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST;
const functionsEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT);

export function FirebaseAppProvider({ children }: PropsWithChildren) {
	const connectFunctionsEmulatorCalled = useRef(false);
	const firebaseConfig = {
		apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
		authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
		messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	};

	const app = initializeApp(firebaseConfig);
	const functions = getFunctions(app, DEFAULT_REGION);

	if (functionsEmulatorHost && functionsEmulatorPort && !connectFunctionsEmulatorCalled.current) {
		console.debug('Using functions emulator');
		connectFunctionsEmulator(functions, functionsEmulatorHost, functionsEmulatorPort);
		connectFunctionsEmulatorCalled.current = true;
	}

	return <FirebaseAppContext.Provider value={app}>{children}</FirebaseAppContext.Provider>;
}
