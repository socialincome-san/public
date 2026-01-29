import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import { ReactNode } from 'react';
import { Navbar } from './navbar/navbar';

type WebsiteAppShellProps = {
	children: ReactNode;
	session?: ContributorSession | LocalPartnerSession;
	lang: WebsiteLanguage;
};

export function WebsiteAppShell({ children, session, lang }: WebsiteAppShellProps) {
	return (
		<div className="theme-new text-primary flex min-h-screen w-full flex-col bg-gradient-to-br from-[hsl(var(--gradient-background-from))] to-[hsl(var(--gradient-background-to))] bg-fixed">
			<Navbar session={session} lang={lang} />
			<div className="container my-8">{children}</div>
		</div>
	);
}
