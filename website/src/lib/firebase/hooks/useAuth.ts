'use client';

import {
	connectFirebaseAuthEmulator,
	getFirebaseClientAuth,
	type FirebaseClientAuth,
} from '@/integrations/firebase/firebase-client.integration';
import { useEffect, useRef } from 'react';
import { useFirebaseApp } from './useFirebaseApp';

const authEmulatorUrl = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;

export const useAuth = (): {
	auth: FirebaseClientAuth;
} => {
	const connectAuthEmulatorCalled = useRef<true | null>(null);
	const app = useFirebaseApp();
	const auth = getFirebaseClientAuth(app);

	useEffect(() => {
		if (authEmulatorUrl && connectAuthEmulatorCalled.current === null) {
			console.debug('Using auth emulator');
			connectFirebaseAuthEmulator(auth, authEmulatorUrl);
			connectAuthEmulatorCalled.current = true;
		}
	}, [auth]);

	return { auth };
};
