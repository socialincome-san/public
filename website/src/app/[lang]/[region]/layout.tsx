import { DefaultLayoutProps } from '@/app/[lang]/[region]/index';
import { CookieConsentBanner } from '@/components/tracking/cookie-consent-banner';
import { mainWebsiteLanguages, websiteRegions } from '@/i18n';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';

export const generateStaticParams = () =>
	websiteRegions.flatMap((region) => mainWebsiteLanguages.map((lang) => ({ lang, region })));

export const generateMetadata = ({ params }: DefaultLayoutProps) => getMetadata(params.lang, 'website-common');

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
