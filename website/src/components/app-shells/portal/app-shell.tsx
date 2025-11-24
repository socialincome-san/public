import { UserSession } from '@/lib/services/user/user.types';
import { ReactNode } from 'react';
import { Navbar } from './navbar/navbar';

type PortalAppShellProps = {
	children: ReactNode;
	user?: UserSession;
};

export function PortalAppShell({ children, user }: PortalAppShellProps) {
	return (
		<div className="text-primary flex min-h-screen w-full flex-col bg-gradient-to-br from-[hsl(var(--gradient-background-from))] to-[hsl(var(--gradient-background-to))] bg-fixed">
			{user && <Navbar user={user} />}

			<div className="container pb-8">{children}</div>
		</div>
	);
}
