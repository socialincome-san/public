'use client';

import { getCurrentUserByAuthId } from '@/app/portal/actions/user';
import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { User as PrismaUser } from '@prisma/client';
import { redirect } from 'next/navigation';
import { createContext, PropsWithChildren, useEffect, useState } from 'react';

export const UserContext = createContext<PrismaUser | null | undefined>(undefined);

export function UserContextProvider({
	children,
	redirectToLogin = false,
}: PropsWithChildren<{ redirectToLogin?: boolean }>) {
	const { authUser } = useAuth();
	const [user, setUser] = useState<PrismaUser | null>(null);

	useEffect(() => {
		const loadUser = async () => {
			if (!authUser?.uid) {
				setUser(null);
				return;
			}

			const dbUser = await getCurrentUserByAuthId(authUser.uid);
			setUser(dbUser);
		};

		loadUser();
	}, [authUser?.uid]);

	useEffect(() => {
		if (user === null && redirectToLogin) {
			redirect('/login');
		}
	}, [user, redirectToLogin]);

	if (!user && redirectToLogin) return null;

	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
