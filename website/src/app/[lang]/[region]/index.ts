export const LANGUAGE_COOKIE = 'si_lang';
export const REGION_COOKIE = 'si_region';
export const COUNTRY_COOKIE = 'si_country';
export const CURRENCY_COOKIE = 'si_currency';

export type DefaultParams = {
	lang: string;
	region: string;
};

export type DefaultLayoutProps<P extends DefaultParams = DefaultParams> = {
	params: Promise<P>;
};

export type DefaultPageProps = DefaultLayoutProps & {
	searchParams: Promise<Record<string, string>>;
};

export type DefaultLayoutPropsWithSlug = DefaultLayoutProps<DefaultParams & { slug: string }>;
