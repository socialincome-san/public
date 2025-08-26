import { AppShell } from '@/app/portal/components/app-shell';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { ReactNode } from 'react';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
	const user = await getAuthenticatedUserOrRedirect();

	return <AppShell user={user}>{children}</AppShell>;
}
