import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import langParser from 'accept-language-parser';
import { NextRequest } from 'next/server';
import { Currency } from '../../shared/src/types/currency';

export type WebsiteLanguage = Extract<LanguageCode, 'en' | 'de' | 'kri'>;
export const defaultLanguage: WebsiteLanguage = 'en';
export const websiteLanguages: WebsiteLanguage[] = ['en', 'de', 'kri'];

export type WebsiteRegion = 'int' | 'ch' | 'sl';
export const defaultRegion: WebsiteRegion = 'int';
export const websiteRegions: WebsiteRegion[] = ['int', 'ch', 'sl'];

export type WebsiteCurrency = Extract<Currency, 'USD' | 'EUR' | 'CHF' | 'SLE'>;
export const defaultCurrency: WebsiteCurrency = 'USD';
export const websiteCurrencies: WebsiteCurrency[] = ['USD', 'EUR', 'CHF', 'SLE'];

export const getCurrencyTranslations = (currencies: WebsiteCurrency[], translator: Translator) =>
	currencies.map((currency) => ({
		code: currency,
		translation: translator.t(`currencies.${currency}`),
	}));

export const findBestLocale = (request: NextRequest): { region: WebsiteRegion; language: WebsiteLanguage } => {
	const options = langParser.parse(request.headers.get('Accept-Language') || 'en');
	// TODO: make sure country is supported
	// TODO: save country/language/currency in cookie if manually updated

	const requestCountry = request.geo?.country;
	const bestOption = options.find(
		(option) =>
			option.code &&
			option.region &&
			websiteLanguages.includes(option.code as WebsiteLanguage) &&
			websiteRegions.includes(option.region as WebsiteRegion),
	);

	return {
		language: (bestOption?.code as WebsiteLanguage) || defaultLanguage,
		region:
			(websiteLanguages.includes(requestCountry as WebsiteLanguage) && (requestCountry as WebsiteRegion)) ||
			(bestOption?.region as WebsiteRegion) ||
			defaultRegion,
	};
};
