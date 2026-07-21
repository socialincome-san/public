import type { Session } from '@/lib/firebase/current-account';
import { ReactNode } from 'react';
import { Navbar } from './navbar/navbar';

type PortalAppShellProps = {
	children: ReactNode;
	sessions: Session[];
};

export const PortalAppShell = ({ children, sessions }: PortalAppShellProps) => {
	return (
		<div className="bg-website-gradient text-primary flex min-h-screen w-full flex-col antialiased">
			<Navbar sessions={sessions} />
			<main className="pb-8">{children}</main>
		</div>
	);
};
