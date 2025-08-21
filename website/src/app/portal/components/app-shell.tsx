import { Navbar2 } from '@/app/portal/components/navbar';
import { PageHeader4 } from '@/app/portal/components/page-header';

import { ReactNode } from 'react';

type AppShellProps = {
	children: ReactNode;
};

export function AppShell3({ children }: AppShellProps) {
	return (
		<div className="theme-portal text-primary flex min-h-screen w-full flex-col bg-gradient-to-br from-[hsl(var(--gradient-background-from))] to-[hsl(var(--gradient-background-to))] bg-fixed">
			<Navbar2 />
			<PageHeader4 />
			<div className="container pb-8">{children}</div>
		</div>
	);
}
