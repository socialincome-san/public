'use client';

import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
	return <TanstackQueryClientProvider client={queryClient}>{children}</TanstackQueryClientProvider>;
}
