import { DefaultLayoutProps } from '@/app/[lang]/[region]/index';
import { CookieConsentBanner } from '@/components/analytics/cookie-consent-banner';
import { mainWebsiteLanguages, websiteRegions } from '@/lib/i18n/utils';
import { getMetadata } from '@/metadata';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';

export const generateStaticParams = () =>
	websiteRegions.flatMap((region) => mainWebsiteLanguages.map((lang) => ({ lang, region })));

export const generateMetadata = async (props: DefaultLayoutProps) => {
	const params = await props.params;
	return getMetadata(params.lang, 'website-common');
};

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
	const { lang } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

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
