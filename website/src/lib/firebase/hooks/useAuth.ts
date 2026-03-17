'use client';

import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { useEffect, useRef } from 'react';
import { useFirebaseApp } from './useFirebaseApp';

const authEmulatorUrl = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;

export const useAuth = (): {
	auth: Auth;
} => {
	const connectAuthEmulatorCalled = useRef<true | null>(null);
	const app = useFirebaseApp();
	const auth = getAuth(app);

	useEffect(() => {
		if (authEmulatorUrl && connectAuthEmulatorCalled.current === null) {
			console.debug('Using auth emulator');
			connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
			connectAuthEmulatorCalled.current = true;
		}
	}, [auth]);

	return { auth };
};
