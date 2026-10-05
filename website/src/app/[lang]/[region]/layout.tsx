import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { CookieConsentBanner } from '@/components/analytics/cookie-consent-banner';
import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { I18nContextProvider } from '@/lib/i18n/i18n-context-provider';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getCurrentSessions } from '@/modules/auth/session.service';

import type { PropsWithChildren } from 'react';

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang, region } = await params;
	const sessionsResult = await getCurrentSessions();
	const sessions = sessionsResult.success ? sessionsResult.data : [];
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-common'],
	});

	return (
		<I18nContextProvider>
			<WebsiteAppShell sessions={sessions} lang={lang as WebsiteLanguage} region={region} scope="website">
				{children}
			</WebsiteAppShell>
			<CookieConsentBanner
				translations={{
					text: translator.t('cookie-consent-banner.text'),
					buttonAccept: translator.t('cookie-consent-banner.button-accept'),
					buttonRefuse: translator.t('cookie-consent-banner.button-refuse'),
				}}
			/>
		</I18nContextProvider>
	);
}
