'use client';

import { Auth, connectAuthEmulator, getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { useFirebaseApp } from './useFirebaseApp';

const authEmulatorUrl = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;

export function useAuth(): {
	auth: Auth;
	authUser: User | null | undefined;
} {
	const connectAuthEmulatorCalled = useRef(false);
	const app = useFirebaseApp();
	const auth = getAuth(app);
	const [authUser, setAuthUser] = useState<User | null>();

	if (authEmulatorUrl && !connectAuthEmulatorCalled.current) {
		console.debug('Using auth emulator');
		connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
		connectAuthEmulatorCalled.current = true;
	}

	useEffect(() => {
		return onAuthStateChanged(auth, (user) => {
			setAuthUser(user);
		});
	}, [auth]);

	return { auth, authUser };
}
