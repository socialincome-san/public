'use client';

import { Status } from '@mailchimp/mailchimp_marketing';
import { User, USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useEffect } from 'react';
import { useFirestore, useUser } from 'reactfire';

interface UserContextProps {
	user: QueryDocumentSnapshot<User> | null | undefined;
	refetch: () => void;
}

export const UserContext = createContext<UserContextProps>(undefined!);
export const useUserContext = () => {
	const { user, refetch } = useContext(UserContext);
	if (!user) {
		throw new Error('useUserContext must be used within a UserContextProvider');
	}
	return { user, refetch };
};

export function UserContextProvider({ children }: PropsWithChildren) {
	const firestore = useFirestore();
	const { data: authUser, status: authUserStatus } = useUser();
	const { data: user, refetch } = useQuery({
		queryKey: ['UserContextProvider', authUser?.uid, firestore],
		queryFn: async () => {
			if (authUser?.uid && firestore) {
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
		return <UserContext.Provider value={{ user, refetch }}>{children}</UserContext.Provider>;
	}
}

export const useMailchimpSubscription = () => {
	const { data: authUser } = useUser();
	const {
		data: status,
		isLoading,
		error,
	} = useQuery<string | null>({
		queryKey: ['mailchimp', authUser?.uid],
		queryFn: async () => {
			const token = await authUser?.getIdToken();
			if (token) {
				const response = await fetch(`/api/mailchimp/subscription?firebaseAuthToken=${token}`);
				return (await response.json()).status;
			}
			return null;
		},
		staleTime: 1000 * 60 * 60, // 1 hour
	});
	return { status, isLoading, error };
};

export const useUpsertMailchimpSubscription = () => {
	const { data: authUser } = useUser();
	const queryClient = useQueryClient();

	return async (status: Status) => {
		const token = await authUser?.getIdToken();
		const response = await fetch(`/api/mailchimp/subscription`, {
			method: 'POST',
			body: JSON.stringify({ status, firebaseAuthToken: token }),
		});
		queryClient.invalidateQueries({ queryKey: ['mailchimp'] });
		return response;
	};
};
