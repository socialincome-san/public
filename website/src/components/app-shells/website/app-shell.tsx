import { Footer } from '@/components/app-shells/website/footer';
import { Navbar } from '@/components/app-shells/website/navbar/navbar';
import { Scope } from '@/components/app-shells/website/navbar/utils';
import type { Session } from '@/lib/firebase/current-account';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { ReactNode } from 'react';

type WebsiteAppShellProps = {
	children: ReactNode;
	sessions: Session[];
	lang: WebsiteLanguage;
	region: string;
	scope: Scope;
};

export const WebsiteAppShell = ({ children, sessions, lang, region, scope }: WebsiteAppShellProps) => {
	const isContained = scope === 'dashboard' || scope === 'partner-space';
	return (
		<div className="theme-new text-primary flex min-h-screen w-full flex-col bg-linear-to-br from-[hsl(var(--gradient-background-from))] to-[hsl(var(--gradient-background-to))] bg-fixed antialiased">
			<Navbar sessions={sessions} lang={lang} region={region} scope={scope} />
			<div
				className={
					isContained
						? 'w-site-width max-w-content mx-auto mt-20 flex-1 pb-8'
						: '[&:not(:has(>.hero-video-block))]:mt-20'
				}
			>
				{children}
			</div>
			{scope === 'website' && <Footer lang={lang} region={region} />}
		</div>
	);
};
