import { auth } from '@/firebase/client';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

export function useAuthUser(): [User | null, boolean] {
	const [isReady, setIsReady] = useState(false);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		auth.onAuthStateChanged((user) => setUser(user));
		auth.authStateReady().then(() => setIsReady(true));
	}, []);

	return [user, isReady];
}
