import { PortalAppShell } from '@/components/app-shells/portal/app-shell';
import { ROUTES } from '@/lib/constants/routes';
import { getSessionsOrRedirect } from '@/lib/firebase/current-account';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function PortalLayout({ children }: { children: ReactNode }) {
	const sessions = await getSessionsOrRedirect();
	if (!sessions.some((s) => s.type === 'user')) {
		redirect(ROUTES.login);
	}

	return <PortalAppShell sessions={sessions}>{children}</PortalAppShell>;
}
