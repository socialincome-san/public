import { ContributorSession } from '@socialincome/shared/src/database/services/contributor/contributor.types';
import { ReactNode } from 'react';
import { Navbar } from './navbar/navbar';

type WebsiteAppShellProps = {
	children: ReactNode;
	contributor?: ContributorSession;
};

export function WebsiteAppShell({ children, contributor }: WebsiteAppShellProps) {
	return (
		<div className="theme-new text-primary flex min-h-screen w-full flex-col bg-gradient-to-br from-[hsl(var(--gradient-background-from))] to-[hsl(var(--gradient-background-to))] bg-fixed">
			{contributor && <Navbar contributor={contributor} />}

			<div className="container pb-8">{children}</div>
		</div>
	);
}
