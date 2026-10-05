import { PortalAppShell } from '@/components/app-shells/portal/app-shell';
import { requireSessions } from '@/server/session';
import type { ReactNode } from 'react';

export default async function PortalLayout({ children }: { children: ReactNode }) {
	const sessions = await requireSessions('user');

	return <PortalAppShell sessions={sessions}>{children}</PortalAppShell>;
}
