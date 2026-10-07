import { LANGUAGE_COOKIE, REGION_COOKIE } from '@/lib/i18n/cookies';
import langParser from 'accept-language-parser';
import { NextRequest } from 'next/server';
import { Currency } from '../../generated/prisma/enums';
import { LanguageCode } from '../types/language';

export type WebsiteLanguage = Extract<LanguageCode, 'en' | 'de' | 'fr' | 'it' | 'kri'>;
export const defaultLanguage: WebsiteLanguage = 'en';
export const mainWebsiteLanguages: WebsiteLanguage[] = ['en', 'de', 'fr', 'it'];
export const allWebsiteLanguages: WebsiteLanguage[] = ['en', 'de', 'fr', 'it', 'kri'];
export const WEBSITE_LANGUAGE_HEADER = 'x-website-language';
// https://vercel.com/docs/headers/request-headers#x-vercel-ip-country
export const VISITOR_COUNTRY_HEADER = 'x-vercel-ip-country';

const isWebsiteLanguage = (value: string): value is WebsiteLanguage =>
	allWebsiteLanguages.includes(value as WebsiteLanguage);

export const getLanguageFromPathname = (pathname: string): WebsiteLanguage | undefined => {
	const detectedLanguage = pathname.split('/').at(1) ?? '';

	return isWebsiteLanguage(detectedLanguage) ? detectedLanguage : undefined;
};

export const resolveWebsiteLanguage = ({
	pathnameLanguage,
	cookieLanguage,
	preferCookie = false,
}: {
	pathnameLanguage?: string;
	cookieLanguage?: string;
	preferCookie?: boolean;
}): WebsiteLanguage => {
	const fromPathname = pathnameLanguage && isWebsiteLanguage(pathnameLanguage) ? pathnameLanguage : undefined;
	const fromCookie = cookieLanguage && isWebsiteLanguage(cookieLanguage) ? cookieLanguage : undefined;

	if (preferCookie) {
		return fromCookie ?? fromPathname ?? defaultLanguage;
	}

	return fromPathname ?? fromCookie ?? defaultLanguage;
};

export const getSafeNumberFormatLocale = (lang: WebsiteLanguage): string => {
	try {
		new Intl.NumberFormat(lang);

		return lang;
	} catch {
		return defaultLanguage;
	}
};

export type WebsiteRegion = 'int' | 'ch' | 'sl';
export const defaultRegion: WebsiteRegion = 'int';
export const websiteRegions: WebsiteRegion[] = ['int', 'ch'];

export type WebsiteCurrency = Extract<Currency, 'USD' | 'EUR' | 'CHF' | 'SLE'>;
export const websiteCurrencies: WebsiteCurrency[] = ['CHF', 'EUR', 'USD'];

export const isWebsiteCurrency = (value: string | undefined): value is WebsiteCurrency =>
	value !== undefined && websiteCurrencies.some((currency) => currency === value);

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

	const options = langParser.parse(request.headers.get('Accept-Language') ?? 'en');
	const visitorCountry = request.headers.get(VISITOR_COUNTRY_HEADER)?.toLowerCase();

	const bestOption = options.find(
		(option) =>
			option.code &&
			option.region &&
			mainWebsiteLanguages.includes(option.code as WebsiteLanguage) &&
			websiteRegions.includes(option.region.toLowerCase() as WebsiteRegion),
	);

	const language = (bestOption?.code as WebsiteLanguage) ?? defaultLanguage;
	const regionFromCountry =
		visitorCountry && websiteRegions.includes(visitorCountry as WebsiteRegion)
			? (visitorCountry as WebsiteRegion)
			: undefined;
	const regionFromLanguage = bestOption?.region?.toLowerCase() as WebsiteRegion | undefined;

	return {
		language,
		region: regionFromCountry ?? regionFromLanguage ?? defaultRegion,
	};
};
