import { ValidCountry, WebsiteLanguage } from '@/i18n';

export interface DefaultParams {
	lang: WebsiteLanguage;
	country: ValidCountry;
}

export interface DefaultPageProps {
	params: DefaultParams;
	searchParams: {};
}
