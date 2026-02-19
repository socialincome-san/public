import { DefaultLayoutProps } from '@/app/[lang]/[region]/index';
import { CookieConsentBanner } from '@/components/legacy/analytics/cookie-consent-banner';
import { I18nContextProvider } from '@/lib/i18n/i18n-context-provider';
import { Translator } from '@/lib/i18n/translator';
import { mainWebsiteLanguages, WebsiteLanguage, websiteRegions } from '@/lib/i18n/utils';
import { getMetadata } from '@/lib/utils/metadata';
import { PropsWithChildren } from 'react';

export const generateStaticParams = () =>
  websiteRegions.flatMap((region) => mainWebsiteLanguages.map((lang) => ({ lang, region })));

export const generateMetadata = async (props: DefaultLayoutProps) => {
  const params = await props.params;

  return getMetadata(params.lang as WebsiteLanguage, 'website-common');
};

export default async function Layout({ children, params }: PropsWithChildren<DefaultLayoutProps>) {
  const { lang } = await params;
  const translator = await Translator.getInstance({
    language: lang as WebsiteLanguage,
    namespaces: ['website-common'],
  });

  return (
    <I18nContextProvider>
      {children}
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
