'use client';

import { ApiClient } from '@/hooks/useApi';
import { createContext, useEffect, useState } from 'react';
import { useUser as useFirebaseUser } from 'reactfire';

export const ApiProviderContext = createContext<ApiClient | undefined>(undefined!);

export function ApiProvider({ children }: { children: React.ReactNode }) {
	const { data: authUser } = useFirebaseUser();
	const [idToken, setIdToken] = useState<string>('');

	useEffect(() => {
		if (authUser) {
			authUser.getIdToken().then(setIdToken);
		}
	}, [authUser, setIdToken]);

	return <ApiProviderContext.Provider value={new ApiClient(idToken)}>{children}</ApiProviderContext.Provider>;
}
