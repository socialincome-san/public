'use client';

import { ApiClient } from '@/lib/api/api-client';
import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { createContext, PropsWithChildren, useEffect, useState } from 'react';

export const ApiClientContext = createContext<ApiClient | undefined>(undefined!);

export function ApiClientProvider({ children }: PropsWithChildren) {
	const { authUser } = useAuth();

	const [idToken, setIdToken] = useState<string>('');

	useEffect(() => {
		if (authUser) {
			authUser.getIdToken().then(setIdToken);
		}
	}, [authUser, setIdToken]);

	return <ApiClientContext.Provider value={new ApiClient(idToken)}>{children}</ApiClientContext.Provider>;
}
