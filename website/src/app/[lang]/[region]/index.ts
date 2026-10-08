export { COUNTRY_COOKIE, CURRENCY_COOKIE } from '@/lib/i18n/cookies';

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
