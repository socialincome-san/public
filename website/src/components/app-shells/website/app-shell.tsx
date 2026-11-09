import { Clarity } from '@/components/analytics/clarity';
import { CookieConsent } from '@/components/analytics/cookie-consent';
import { Footer } from '@/components/app-shells/website/footer';
import { Navbar } from '@/components/app-shells/website/navbar/navbar';
import { Scope } from '@/components/app-shells/website/navbar/utils';
import { DonationModalProvider } from '@/components/donation-wizard/modal/donation-modal-provider';
import { getWebsiteBasePath, type WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import type { Session } from '@/modules/auth/auth.types';
import { ReactNode } from 'react';

type WebsiteAppShellProps = {
	children: ReactNode;
	sessions: Promise<Session[]>;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	scope: Scope;
};

export const WebsiteAppShell = ({ children, sessions, lang, currency, scope }: WebsiteAppShellProps) => {
	const isContained = scope === 'dashboard' || scope === 'partner-space';

	return (
		<DonationModalProvider>
			<div className="bg-website-gradient text-primary flex min-h-screen w-full flex-col antialiased">
				<Navbar sessions={sessions} lang={lang} currency={currency} scope={scope} />
				{/* Next.js keeps previously visited pages in the DOM, hidden with an inline `display: none`, so only a
				    visible hero may remove the space below the floating header. */}
				<main
					className={
						isContained
							? 'w-site-width max-w-content mx-auto mt-20 flex-1 overflow-x-clip pb-8'
							: "overflow-x-clip [&:not(:has(>.full-bleed-hero:not([style*='display:_none'])))]:lg:mt-20"
					}
				>
					{children}
				</main>
				<Footer lang={lang} currency={currency} />
				<CookieConsent privacyPolicyHref={`${getWebsiteBasePath(lang, currency)}/legal`} />
				<Clarity />
			</div>
		</DonationModalProvider>
	);
};
