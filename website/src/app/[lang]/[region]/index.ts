import { WebsiteLanguage, WebsiteRegion } from '@/i18n';

export const LANGUAGE_COOKIE = 'si_lang';
export const REGION_COOKIE = 'si_region';
export const CURRENCY_COOKIE = 'si_currency';

export interface DefaultParams {
	country?: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
}

export interface DefaultLayoutProps {
	params: DefaultParams;
}

export interface DefaultPageProps extends DefaultLayoutProps {
	searchParams: Record<string, string>;
}
