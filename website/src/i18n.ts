import { Language } from '@socialincome/shared/src/types';
import langParser from 'accept-language-parser';
import { NextRequest, NextResponse } from 'next/server';

export const defaultCountry = 'us';
export const countries = ['us', 'ca', 'ch', 'sl'];
export type ValidCountry = (typeof countries)[number];

export const defaultLanguage = 'en';
export type WebsiteLanguage = Extract<Language, 'en' | 'de' | 'kri'>;
export const websiteLanguages: WebsiteLanguage[] = ['en', 'de', 'kri'];

const findBestLocale = (request: NextRequest) => {
	const options = langParser.parse(request.headers.get('Accept-Language') || 'en');
	const requestCountry = request.geo?.country?.toLowerCase();

	console.log('requestCountry', requestCountry);

	const bestOption = options.find(
		(option) =>
			option.code &&
			option.region &&
			websiteLanguages.includes(option.code as WebsiteLanguage) &&
			countries.includes(option.region),
	);

	return {
		language: bestOption?.code || defaultLanguage,
		country:
			bestOption?.region ||
			(websiteLanguages.includes(requestCountry as WebsiteLanguage) && requestCountry) ||
			defaultCountry,
	};
};

export const internationalizationMiddleware = (request: NextRequest) => {
	const segments = request.nextUrl.pathname.split('/');
	const detectedLanguage = segments.at(1) ?? '';
	const detectedCountry = segments.at(2) ?? '';

	const pathnameIsMissingLanguage = !websiteLanguages.includes(detectedLanguage as WebsiteLanguage);
	const pathnameIsMissingCountry = !countries.includes(detectedCountry);

	if (pathnameIsMissingCountry || pathnameIsMissingLanguage) {
		let { language, country } = findBestLocale(request);
		language = pathnameIsMissingLanguage ? language : detectedLanguage;
		country = pathnameIsMissingCountry ? country : detectedCountry;

		const url = request.nextUrl.clone();
		url.pathname =
			`/${language}/${country}` +
			(pathnameIsMissingLanguage && segments.at(1) ? `/${segments.at(1)}` : '') +
			(pathnameIsMissingCountry && segments.at(2) ? `/${segments.at(2)}` : '') +
			`/${segments.slice(3).join('/')}`;

		return NextResponse.redirect(url);
	}
};
