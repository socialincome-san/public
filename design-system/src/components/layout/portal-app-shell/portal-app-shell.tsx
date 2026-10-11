import { type ReactNode } from 'react';

export type PortalAppShellProps = {
	navbar: ReactNode;
	children: ReactNode;
};

export const PortalAppShell = ({ navbar, children }: PortalAppShellProps) => (
	<div className="bg-website-gradient text-primary flex min-h-screen w-full flex-col antialiased">
		{navbar}
		<main className="pb-8">{children}</main>
	</div>
);
