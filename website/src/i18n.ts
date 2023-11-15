import { LANGUAGE_COOKIE, REGION_COOKIE } from '@/app/[lang]/[region]';
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
export const websiteCurrencies: WebsiteCurrency[] = ['USD', 'EUR', 'CHF'];

export const getCurrencyTranslations = (currencies: WebsiteCurrency[], translator: Translator) =>
	currencies.map((currency) => ({
		code: currency,
		translation: translator.t(`currencies.${currency}`),
	}));

export const findBestLocale = (
	request: NextRequest,
): {
	region: WebsiteRegion;
	language: WebsiteLanguage;
} => {
	/**
	 * Check if the user has set a language and region cookie, and if they are valid. If so, return them.
	 * Otherwise, try to find the best locale from the Accept-Language header, and if that fails, return the default locale.
	 */
	if (
		request.cookies.has(LANGUAGE_COOKIE) &&
		websiteLanguages.includes(request.cookies.get(LANGUAGE_COOKIE)!.value as WebsiteLanguage) &&
		request.cookies.has(REGION_COOKIE) &&
		websiteRegions.includes(request.cookies.get(REGION_COOKIE)!.value as WebsiteRegion)
	) {
		return {
			language: request.cookies.get(LANGUAGE_COOKIE)!.value as WebsiteLanguage,
			region: request.cookies.get(REGION_COOKIE)!.value as WebsiteRegion,
		};
	}

	const options = langParser.parse(request.headers.get('Accept-Language') || 'en');
	const requestRegion = request.geo?.country;
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
			(websiteRegions.includes(requestRegion as WebsiteRegion) && (requestRegion as WebsiteRegion)) ||
			(bestOption?.region as WebsiteRegion) ||
			defaultRegion,
	};
};
