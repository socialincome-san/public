'use client';

import { User, USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { createContext, PropsWithChildren, useEffect } from 'react';
import { useFirestore, useUser } from 'reactfire';

export const UserContext = createContext<QueryDocumentSnapshot<User> | null | undefined>(undefined!);

export function UserContextProvider({ children }: PropsWithChildren) {
	const firestore = useFirestore();
	const { data: authUser, status: authUserStatus } = useUser();
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
		staleTime: 1000 * 60 * 60, // 1 hour
	});

	useEffect(() => {
		if (user === null && authUserStatus === 'success') {
			// If the user is null, it couldn't be found in the database, so redirect to the login page.
			// If the user is undefined, the query is still loading, so no redirect.
			redirect('../login');
		}
	}, [user, authUserStatus]);

	if (user) {
		return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
	}
}
