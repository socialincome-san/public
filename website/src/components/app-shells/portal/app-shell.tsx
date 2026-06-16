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
			<div className="w-site-width max-w-content mx-auto pb-8">{children}</div>
		</div>
	);
};
