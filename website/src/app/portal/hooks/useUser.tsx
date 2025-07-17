'use client';

import { UserContext } from '@/app/portal/providers/UserContextProvider';
import { User as PrismaUser } from '@prisma/client';
import { useContext } from 'react';

export function useUser(): PrismaUser | null {
	const user = useContext(UserContext);

	if (user === undefined) {
		throw new Error('useUser must be used within a UserContextProvider');
	}

	return user;
}
