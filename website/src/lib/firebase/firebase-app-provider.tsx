'use client';

import {
	connectFirebaseFunctionsEmulator,
	initializeFirebaseClientApp,
	type FirebaseClientApp,
} from '@/integrations/firebase/firebase-client.integration';
import { createContext, PropsWithChildren, useEffect, useRef } from 'react';

export const FirebaseAppContext = createContext<FirebaseClientApp | undefined>(undefined);
const functionsEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST;
const functionsEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT);

export const FirebaseAppProvider = ({ children }: PropsWithChildren) => {
	const connectFunctionsEmulatorCalled = useRef<true | null>(null);
	const app = initializeFirebaseClientApp();

	useEffect(() => {
		if (functionsEmulatorHost && functionsEmulatorPort && connectFunctionsEmulatorCalled.current === null) {
			console.debug('Using functions emulator');
			connectFirebaseFunctionsEmulator(app, functionsEmulatorHost, functionsEmulatorPort);
			connectFunctionsEmulatorCalled.current = true;
		}
	}, [app]);

	return <FirebaseAppContext.Provider value={app}>{children}</FirebaseAppContext.Provider>;
};
