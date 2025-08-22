import { Navbar } from '@/app/portal/components/navbar';
import { PageHeader } from '@/app/portal/components/page-header';

import { ReactNode } from 'react';

type AppShellProps = {
	children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
	return (
		<div className="theme-portal text-primary flex min-h-screen w-full flex-col bg-gradient-to-br from-[hsl(var(--gradient-background-from))] to-[hsl(var(--gradient-background-to))] bg-fixed">
			<Navbar />
			<PageHeader />
			<div className="container pb-8">{children}</div>
		</div>
	);
}
