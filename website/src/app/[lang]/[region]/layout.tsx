import { DefaultLayoutProps } from '@/app/[lang]/[region]/index';
import { CookieConsentBanner } from '@/components/tracking/cookie-consent-banner';
import { mainWebsiteLanguages, websiteRegions } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';

export const generateStaticParams = () =>
	websiteRegions.flatMap((region) => mainWebsiteLanguages.map((lang) => ({ lang, region })));

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-common'],
	});

	return (
		<>
			<Toaster />
			{children}
			<CookieConsentBanner
				translations={{
					text: translator.t('cookie-consent-banner.text'),
					buttonAccept: translator.t('cookie-consent-banner.button-accept'),
					buttonRefuse: translator.t('cookie-consent-banner.button-refuse'),
				}}
			/>
		</>
	);
}
