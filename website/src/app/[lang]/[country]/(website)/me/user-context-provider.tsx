'use client';

import { User, USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/User';
import { useQuery } from '@tanstack/react-query';
import assert from 'assert';
import { collection, getDocs, query, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { createContext, PropsWithChildren, useEffect } from 'react';
import { useFirestore, useUser } from 'reactfire';

interface UserContextProps {
	user: QueryDocumentSnapshot<User> | null | undefined;
}

export const UserContext = createContext<UserContextProps>({ user: null });

export function UserContextProvider({ children }: PropsWithChildren) {
	const firestore = useFirestore();
	const { status: authUserStatus, data: authUser } = useUser();

	console.log('user context', authUserStatus, authUser);

	useEffect(() => {
		if (authUserStatus === 'success' && authUser === null) {
			redirect('../login');
		}
	}, [authUserStatus, authUser]);

	const { data: user } = useQuery(
		[authUser, firestore],
		async () => {
			if (authUser && firestore) {
				let snapshot = await getDocs(
					query(collection(firestore, USER_FIRESTORE_PATH), where('authUserId', '==', authUser?.uid)),
				);
				assert(snapshot.size === 1);
				return snapshot.docs[0] as QueryDocumentSnapshot<User>;
			} else return null;
		},
		{
			staleTime: 1000 * 60 * 60, // 1 hour
			refetchOnMount: false,
		},
	);

	return <UserContext.Provider value={{ user: user }}>{children}</UserContext.Provider>;
}
