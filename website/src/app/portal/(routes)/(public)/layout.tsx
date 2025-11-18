import { PortalAppShell } from '@/app/portal/components/portal-app-shell';
import type { ReactNode } from 'react';

export default async function PublicLayout({ children }: { children: ReactNode }) {
	return <PortalAppShell>{children}</PortalAppShell>;
}
