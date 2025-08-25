import { Navbar } from '@/app/portal/components/navbar';
import { ReactNode } from 'react';

type AppShellProps = {
	children: ReactNode;
	user: any;
};

export function AppShell({ children, user }: AppShellProps) {
	return (
		<div className="text-primary flex min-h-screen w-full flex-col bg-gradient-to-br from-[hsl(var(--gradient-background-from))] to-[hsl(var(--gradient-background-to))] bg-fixed">
			<Navbar user={user} />

			<div className="container pb-8">{children}</div>
		</div>
	);
}
