import type { Session } from '@/modules/auth/auth.types';
import { PortalAppShell as PortalAppShellLayout } from '@socialincome/design-system/layout/portal-app-shell/portal-app-shell';
import { type ReactNode } from 'react';
import { Navbar } from './navbar/navbar';

type PortalAppShellProps = {
	children: ReactNode;
	sessions: Session[];
};

export const PortalAppShell = ({ children, sessions }: PortalAppShellProps) => (
	<PortalAppShellLayout navbar={<Navbar sessions={sessions} />}>{children}</PortalAppShellLayout>
);
