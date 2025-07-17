'use client';

import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { useFirestore } from '@/lib/firebase/hooks/useFirestore';
import { User, USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { createContext, PropsWithChildren, useEffect } from 'react';

export const UserContext = createContext<QueryDocumentSnapshot<User> | null | undefined>(undefined!);

export function UserContextProvider({
	children,
	redirectToLogin = false,
}: PropsWithChildren<{ redirectToLogin?: boolean }>) {
	const firestore = useFirestore();
	const { authUser } = useAuth();
	const { data: user } = useQuery({
		queryKey: ['me', authUser?.uid],
		queryFn: async () => {
			if (authUser?.uid) {
				let snapshot = await getDocs(
					query(collection(firestore, USER_FIRESTORE_PATH), where('auth_user_id', '==', authUser?.uid)),
				);
				if (snapshot.size === 1) {
					return snapshot.docs[0] as QueryDocumentSnapshot<User>;
				}
				return null;
			}
			return null;
		},
	});

	useEffect(() => {
		if (user === null && redirectToLogin) {
			// If the user is null, it couldn't be found in the database, so redirect to the login page.
			// If the user is undefined, the query is still loading, so no redirect.
			redirect('../login');
		}
	}, [user, redirectToLogin]);

	if (!user) {
		return redirectToLogin ? null : <>{children}</>;
	}

	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
