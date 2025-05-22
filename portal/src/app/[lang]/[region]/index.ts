import { WebsiteLanguage, WebsiteRegion } from '@/i18n';

export const LANGUAGE_COOKIE = 'si_lang';
export const REGION_COOKIE = 'si_region';
export const COUNTRY_COOKIE = 'si_country';
export const CURRENCY_COOKIE = 'si_currency';

export interface DefaultParams {
	lang: WebsiteLanguage;
	region: WebsiteRegion;
}

export interface DefaultLayoutProps {
	params: Promise<DefaultParams>;
}

export interface DefaultPageProps extends DefaultLayoutProps {
	searchParams: Promise<Record<string, string>>;
}
