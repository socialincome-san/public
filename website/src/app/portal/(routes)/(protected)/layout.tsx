import { PortalAppShell } from '@/app/portal/components/portal-app-shell';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { ReactNode } from 'react';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
	const user = await getAuthenticatedUserOrRedirect();

	return <PortalAppShell user={user}>{children}</PortalAppShell>;
}
