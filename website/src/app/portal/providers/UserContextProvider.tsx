'use client';

import { getCurrentUserByAuthId } from '@/app/portal/actions/user';
import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { User as PrismaUser } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useEffect, useState } from 'react';

export const UserContext = createContext<PrismaUser | null | undefined>(undefined);

export function UserContextProvider({
	children,
	redirectToLogin = false,
}: PropsWithChildren<{ redirectToLogin?: boolean }>) {
	const { authUser, isLoading } = useAuth();
	const router = useRouter();

	const [user, setUser] = useState<PrismaUser | null | undefined>(undefined);

	useEffect(() => {
		const loadUser = async () => {
			if (isLoading) return;
			if (!authUser?.uid) {
				setUser(null);
				return;
			}

			const dbUser = await getCurrentUserByAuthId(authUser.uid);
			setUser(dbUser ?? null);
		};

		loadUser();
	}, [authUser?.uid, isLoading]);

	useEffect(() => {
		if (!isLoading && user === null && redirectToLogin) {
			router.replace('/login');
		}
	}, [isLoading, user, redirectToLogin, router]);

	if (isLoading || user === undefined) return null;

	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
