import { ValidCountry, ValidLanguage } from '@/i18n';

export interface DefaultParams {
	lang: ValidLanguage;
	country: ValidCountry;
}

export interface DefaultPageProps {
	params: DefaultParams;
	searchParams: {};
}
