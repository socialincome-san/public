import { Session } from '@/lib/firebase/current-account';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ReactNode } from 'react';
import { Scope } from './navbar/account-menu';
import { Navbar } from './navbar/navbar';

type WebsiteAppShellProps = {
	children: ReactNode;
	session: Session | null;
	lang: WebsiteLanguage;
	scope: Scope;
};

export function WebsiteAppShell({ children, session, lang, scope }: WebsiteAppShellProps) {
	return (
		<div className="theme-new text-primary flex min-h-screen w-full flex-col bg-gradient-to-br from-[hsl(var(--gradient-background-from))] to-[hsl(var(--gradient-background-to))] bg-fixed">
			<Navbar session={session} lang={lang} scope={scope} />
			<div className="container my-8">{children}</div>
		</div>
	);
}
