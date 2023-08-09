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
	let language;
	let country;
	for (const option of options) {
		if (!language && option.code in websiteLanguages) language = option.code;
		if (!country && option.region && option.region in countries) country = option.region;
	}
	return {
		language: language || defaultLanguage,
		country: country || request.geo?.country?.toLowerCase() || defaultCountry,
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
