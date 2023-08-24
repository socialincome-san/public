import { ValidCountry, WebsiteLanguage } from '@/i18n';

export interface DefaultParams {
	lang: WebsiteLanguage;
	country: ValidCountry;
}

export interface DefaultLayoutProps {
	params: DefaultParams;
}

export interface DefaultPageProps extends DefaultLayoutProps {
	searchParams: Record<string, string>;
}
