'use client';

import { User, USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { useQuery } from '@tanstack/react-query';
import assert from 'assert';
import { collection, getDocs, query, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useEffect } from 'react';
import { useFirestore, useUser } from 'reactfire';

interface UserContextProps {
	user: QueryDocumentSnapshot<User> | null | undefined;
	refetch: () => void;
}

export const UserContext = createContext<UserContextProps>(undefined!);
export const useUserContext = () => useContext(UserContext);

export function UserContextProvider({ children }: PropsWithChildren) {
	const firestore = useFirestore();
	const { data: authUser } = useUser();

	const { data: user, refetch } = useQuery({
		queryKey: ['UserContextProvider', authUser?.uid, firestore],
		queryFn: async () => {
			if (authUser?.uid && firestore) {
				let snapshot = await getDocs(
					query(collection(firestore, USER_FIRESTORE_PATH), where('authUserId', '==', authUser?.uid)),
				);
				assert(snapshot.size === 1);
				return snapshot.docs[0] as QueryDocumentSnapshot<User>;
			} else return null;
		},
		staleTime: 1000 * 60 * 60, // 1 hour
	});

	useEffect(() => {
		if (user === null) {
			redirect('../login');
		}
	}, [user]);

	if (user) {
		return <UserContext.Provider value={{ user, refetch }}>{children}</UserContext.Provider>;
	}
}
