import { Footer } from '@/components/app-shells/website/footer';
import { Scope } from '@/components/app-shells/website/navbar/account-menu';
import { Navbar } from '@/components/app-shells/website/navbar/navbar';
import { Session } from '@/lib/firebase/current-account';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ReactNode } from 'react';

type WebsiteAppShellProps = {
	children: ReactNode;
	session: Session | null;
	lang: WebsiteLanguage;
	region: string;
	scope: Scope;
};

export function WebsiteAppShell({ children, session, lang, region, scope }: WebsiteAppShellProps) {
	return (
		<div className="theme-new text-primary flex min-h-screen w-full flex-col bg-gradient-to-br from-[hsl(var(--gradient-background-from))] to-[hsl(var(--gradient-background-to))] bg-fixed antialiased">
			<Navbar session={session} lang={lang} scope={scope} />
			<div className="container my-8">{children}</div>
			<Footer lang={lang} region={region} />
		</div>
	);
}
