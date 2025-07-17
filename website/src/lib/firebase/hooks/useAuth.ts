'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Auth, connectAuthEmulator, getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useRef } from 'react';
import { useFirebaseApp } from './useFirebaseApp';

const authEmulatorUrl = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;
const AUTH_USER_QUERY_KEY = ['authUser'];

export function useAuth(): {
	auth: Auth;
	authUser: User | null | undefined;
} {
	const connectAuthEmulatorCalled = useRef(false);
	const app = useFirebaseApp();
	const auth = getAuth(app);
	const queryClient = useQueryClient();

	if (authEmulatorUrl && !connectAuthEmulatorCalled.current) {
		console.debug('Using auth emulator');
		connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
		connectAuthEmulatorCalled.current = true;
	}

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			queryClient.setQueryData(AUTH_USER_QUERY_KEY, user);
		});
		return () => unsubscribe();
	}, [auth, queryClient]);

	const { data: authUser } = useQuery({
		queryKey: AUTH_USER_QUERY_KEY,
		queryFn: () => auth.currentUser,
		staleTime: Infinity,
	});

	return { auth, authUser };
}
