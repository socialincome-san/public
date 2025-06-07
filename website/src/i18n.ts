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

export const toLocale = (language: WebsiteLanguage, region: WebsiteRegion): string => {
	return language + (region === 'ch' ? '-CH' : '');
};

export const toCurrencyLocale = (
	language: WebsiteLanguage,
	region: WebsiteRegion,
	currency: Currency,
	options?: Partial<Intl.ResolvedNumberFormatOptions>,
): Partial<Intl.ResolvedNumberFormatOptions> => {
	return {
		style: 'currency' as keyof Intl.NumberFormatOptionsStyleRegistry,
		currency: currency,
		locale: toLocale(language, region),
		...options,
	};
};

/**
 * Check if the user has set a language and region cookie, and if they are valid. If so, return them.
 * Otherwise, try to find the best locale from the Accept-Language header, and if that fails, return the default locale.
 */
export const findBestLocale = (
	request: NextRequest,
): {
	region: WebsiteRegion;
	language: WebsiteLanguage;
} => {
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
	const cfCountry = request.headers.get('cf-ipcountry')?.toLowerCase();

	const bestOption = options.find(
		(option) =>
			option.code &&
			option.region &&
			mainWebsiteLanguages.includes(option.code as WebsiteLanguage) &&
			websiteRegions.includes(option.region.toLowerCase() as WebsiteRegion),
	);

	return {
		language: (bestOption?.code as WebsiteLanguage) || defaultLanguage,
		region:
			(cfCountry && websiteRegions.includes(cfCountry as WebsiteRegion) && (cfCountry as WebsiteRegion)) ||
			(bestOption?.region?.toLowerCase() as WebsiteRegion) ||
			defaultRegion,
	};
};
