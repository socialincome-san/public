import { WebsiteRegion } from "@/lib/i18n/utils";
import { LanguageCode } from "@/lib/types/language";

export const LANGUAGE_COOKIE = 'si_lang';
export const REGION_COOKIE = 'si_region';
export const COUNTRY_COOKIE = 'si_country';
export const CURRENCY_COOKIE = 'si_currency';

export interface DefaultParams {
	lang: LanguageCode;
	region: WebsiteRegion;
}

export interface DefaultLayoutProps {
	params: Promise<DefaultParams>;
}

export interface DefaultPageProps extends DefaultLayoutProps {
	searchParams: Promise<Record<string, string>>;
}

export interface DefaultParamsWithSlug extends DefaultParams {
	slug: string;
}

export interface DefaultLayoutPropsWithSlug {
	params: Promise<DefaultParamsWithSlug>;
}
