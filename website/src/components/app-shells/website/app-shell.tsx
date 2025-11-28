import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { ReactNode } from 'react';
import { Navbar } from './navbar/navbar';

type WebsiteAppShellProps = {
	children: ReactNode;
	contributor?: ContributorSession;
	lang: WebsiteLanguage;
};

export function WebsiteAppShell({ children, contributor, lang }: WebsiteAppShellProps) {
	return (
		<div className="theme-new text-primary flex min-h-screen w-full flex-col bg-gradient-to-br from-[hsl(var(--gradient-background-from))] to-[hsl(var(--gradient-background-to))] bg-fixed">
			{contributor && <Navbar contributor={contributor} lang={lang} />}

			<div className="container pb-8">{children}</div>
		</div>
	);
}
