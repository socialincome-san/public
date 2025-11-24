'use client';

import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { useRef } from 'react';
import { useFirebaseApp } from './useFirebaseApp';

const authEmulatorUrl = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;

export function useAuth(): {
	auth: Auth;
} {
	const connectAuthEmulatorCalled = useRef(false);
	const app = useFirebaseApp();
	const auth = getAuth(app);

	if (authEmulatorUrl && !connectAuthEmulatorCalled.current) {
		console.debug('Using auth emulator');
		connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
		connectAuthEmulatorCalled.current = true;
	}

	return { auth };
}
