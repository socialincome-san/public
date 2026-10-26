import langParser from 'accept-language-parser';
import { NextRequest } from 'next/server';
import { Currency } from '../../generated/prisma/enums';
import { getVisitorCountry } from '../geo/visitor-geo';
import { isValidCountryCode } from '../types/country';
import { getCountryCurrency } from '../types/currency';
import { LanguageCode } from '../types/language';

export type WebsiteLanguage = Extract<LanguageCode, 'en' | 'de' | 'fr' | 'it' | 'kri'>;
export const defaultLanguage: WebsiteLanguage = 'en';
export const TIME_ZONE = 'Europe/Zurich';
export const mainWebsiteLanguages: WebsiteLanguage[] = ['en', 'de', 'fr', 'it'];
export const allWebsiteLanguages: WebsiteLanguage[] = ['en', 'de', 'fr', 'it', 'kri'];

export const isWebsiteLanguage = (value: string | undefined): value is WebsiteLanguage =>
	allWebsiteLanguages.includes(value as WebsiteLanguage);

export const getSafeNumberFormatLocale = (lang: WebsiteLanguage): string => {
	try {
		new Intl.NumberFormat(lang);

		return lang;
	} catch {
		return defaultLanguage;
	}
};

export type WebsiteCurrency = Extract<Currency, 'USD' | 'EUR' | 'CHF'>;
export const websiteCurrencies: WebsiteCurrency[] = ['CHF', 'EUR', 'USD'];
export const defaultCurrency: WebsiteCurrency = 'USD';

export const isWebsiteCurrency = (value: string | undefined): value is WebsiteCurrency =>
	value !== undefined && websiteCurrencies.some((currency) => currency === value);

// The URL segment after the language, e.g. `/de/chf/programs`.
export type WebsiteCurrencySegment = Lowercase<WebsiteCurrency>;

const currencySegments: Record<WebsiteCurrency, WebsiteCurrencySegment> = { CHF: 'chf', EUR: 'eur', USD: 'usd' };

export const toCurrencySegment = (currency: WebsiteCurrency): WebsiteCurrencySegment => currencySegments[currency];

export const parseCurrencySegment = (segment: string | undefined): WebsiteCurrency | undefined =>
	websiteCurrencies.find((currency) => currencySegments[currency] === segment);

// For pages below the website layout, which already 404s unknown currency segments.
export const toWebsiteCurrency = (segment: string): WebsiteCurrency => parseCurrencySegment(segment) ?? defaultCurrency;

export const getWebsiteBasePath = (lang: string, currency: WebsiteCurrency) => `/${lang}/${toCurrencySegment(currency)}`;

const isMainWebsiteLanguage = (value: string): value is WebsiteLanguage =>
	mainWebsiteLanguages.some((language) => language === value);

/** The country's own currency, if the website supports it. */
export const getCurrencyForCountry = (country: string | undefined): WebsiteCurrency | undefined => {
	const countryCode = country?.toUpperCase();
	if (!countryCode || !isValidCountryCode(countryCode)) {
		return undefined;
	}
	// Not bestGuessCurrency: its USD fallback would count USD as the own currency of every country missing from the list.
	const currency = getCountryCurrency(countryCode);

	return isWebsiteCurrency(currency) ? currency : undefined;
};

/**
 * Picks the language and currency for a URL without them: the first supported Accept-Language entry, and the
 * currency of the geo-IP country (or of the Accept-Language region when there is no geo header).
 */
export const findBestLocale = (request: NextRequest): { language: WebsiteLanguage; currency: WebsiteCurrency } => {
	const options = langParser.parse(request.headers.get('Accept-Language') ?? '');
	const language = options.map((option) => option.code).find(isMainWebsiteLanguage) ?? defaultLanguage;
	const country = getVisitorCountry(request) ?? options.find((option) => option.region)?.region;

	return { language, currency: getCurrencyForCountry(country) ?? defaultCurrency };
};
