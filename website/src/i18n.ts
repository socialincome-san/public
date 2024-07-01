import { LANGUAGE_COOKIE, REGION_COOKIE } from '@/app/[lang]/[region]';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import langParser from 'accept-language-parser';
import { NextRequest } from 'next/server';
import { Currency } from '../../shared/src/types/currency';

export type WebsiteLanguage = Extract<LanguageCode, 'en' | 'de' | 'fr' | 'it' | 'kri'>;
export const defaultLanguage: WebsiteLanguage = 'en';
export const mainWebsiteLanguages: WebsiteLanguage[] = ['en', 'de', 'fr', 'it'];
export const allWebsiteLanguages: WebsiteLanguage[] = ['en', 'de', 'fr', 'it', 'kri'];

export type WebsiteRegion = 'int' | 'ch' | 'sl';
export const defaultRegion: WebsiteRegion = 'int';
export const websiteRegions: WebsiteRegion[] = ['int', 'ch'];

export type WebsiteCurrency = Extract<Currency, 'USD' | 'EUR' | 'CHF' | 'SLE'>;
export const defaultCurrency: WebsiteCurrency = 'USD';
export const websiteCurrencies: WebsiteCurrency[] = ['USD', 'EUR', 'CHF'];

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
		mainWebsiteLanguages.includes(request.cookies.get(LANGUAGE_COOKIE)!.value as WebsiteLanguage) &&
		request.cookies.has(REGION_COOKIE) &&
		websiteRegions.includes(request.cookies.get(REGION_COOKIE)!.value as WebsiteRegion)
	) {
		return {
			language: request.cookies.get(LANGUAGE_COOKIE)!.value as WebsiteLanguage,
			region: request.cookies.get(REGION_COOKIE)!.value as WebsiteRegion,
		};
	}

	const options = langParser.parse(request.headers.get('Accept-Language') || 'en');
	const requestCountry = request.geo?.country?.toLowerCase() as WebsiteRegion | undefined;
	console.info('Country set in request header:', requestCountry);

	const bestOption = options.find(
		(option) =>
			option.code &&
			option.region &&
			mainWebsiteLanguages.includes(option.code as WebsiteLanguage) &&
			websiteRegions.includes(option.region as WebsiteRegion),
	);

	return {
		language: (bestOption?.code as WebsiteLanguage) || defaultLanguage,
		region:
			(requestCountry && websiteRegions.includes(requestCountry) && requestCountry) ||
			(bestOption?.region as WebsiteRegion) ||
			defaultRegion,
	};
};
