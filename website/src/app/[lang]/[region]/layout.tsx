import { RootDocument } from '@/app/root-document';
import { CookieConsentBanner } from '@/components/analytics/cookie-consent-banner';
import { WebsiteAppShell } from '@/components/app-shells/website/app-shell';
import { getCurrentSessions } from '@/lib/firebase/current-account';
import { I18nContextProvider } from '@/lib/i18n/i18n-context-provider';
import { Translator } from '@/lib/i18n/translator';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import { getMetadata } from '@/lib/utils/metadata';
import type { Viewport } from 'next';
import type { PropsWithChildren } from 'react';

export const generateMetadata = () => getMetadata('en', 'website-common');

export const viewport: Viewport = {
	themeColor: '#3373BB',
};

export default async function Layout({ children }: PropsWithChildren) {
	const { lang } = await getWebsiteRootParams();
	const sessions = await getCurrentSessions();
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-common'],
	});

	return (
		<RootDocument lang={lang}>
			<I18nContextProvider>
				<WebsiteAppShell sessions={sessions} scope="website">
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
		</RootDocument>
	);
}
