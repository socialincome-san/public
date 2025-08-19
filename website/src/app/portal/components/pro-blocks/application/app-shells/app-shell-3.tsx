import { Navbar2 } from '@/app/portal/components/pro-blocks/application/navbars/navbar-2';
import { PageHeader4 } from '@/app/portal/components/pro-blocks/page-headers/page-header-4';

import { ReactNode } from 'react';

type AppShellProps = {
	children: ReactNode;
};

export function AppShell3({ children }: AppShellProps) {
	return (
		<div className="theme-portal text-primary flex min-h-screen w-full flex-col bg-gradient-to-b from-[hsl(var(--gradient-background-from))] to-[hsl(var(--gradient-background-to))]">
			<Navbar2 />
			<PageHeader4 />
			<div className="container">{children}</div>
		</div>
	);
}
