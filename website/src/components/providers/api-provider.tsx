'use client';

import { ApiClient } from '@/hooks/useApi';
import { createContext } from 'react';
import { useUser as useFirebaseUser, useIdTokenResult } from 'reactfire';

export const ApiProviderContext = createContext<ApiClient | undefined>(undefined!);

export function ApiProvider({ children }: { children: React.ReactNode }) {
	const { data: authUser } = useFirebaseUser();
	if (!authUser) {
		return;
	}
	const token = useIdTokenResult(authUser);
	if (!token.data) {
		return;
	}
	return <ApiProviderContext.Provider value={new ApiClient(token.data.token)}>{children}</ApiProviderContext.Provider>;
}
