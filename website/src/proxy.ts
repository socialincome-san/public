import { CURRENCY_COOKIE } from '@/lib/i18n/cookies';
import {
	findBestLocale,
	getLanguageFromPathname,
	isWebsiteCurrency,
	VISITOR_COUNTRY_HEADER,
	WebsiteRegion,
	websiteRegions,
} from '@/lib/i18n/utils';
import { isValidCountryCode } from '@/lib/types/country';
import { bestGuessCurrency } from '@/lib/types/currency';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
	matcher: [
		// Skip internal paths (_next)
		'/((?!api|_next/static|_next/image|assets|fonts|favicon.ico|sw.js|portal|partner-space|v1/api-docs|openapi.json|sitemap.xml|robots.txt|llms.txt).*)',
	],
};

// Guesses the visitor's currency once from the geo header; the client reads and changes the preference.
const currencyMiddleware = (request: NextRequest, response: NextResponse) => {
	if (isWebsiteCurrency(request.cookies.get(CURRENCY_COOKIE)?.value)) {
		return response;
	}

	const country = request.headers.get(VISITOR_COUNTRY_HEADER)?.toUpperCase();
	const currency = country && isValidCountryCode(country) ? bestGuessCurrency(country) : undefined;
	if (isWebsiteCurrency(currency)) {
		response.cookies.set({ name: CURRENCY_COOKIE, value: currency, path: '/', maxAge: 60 * 60 * 24 * 7 }); // 1 week
	}

	return response;
};

const i18nRedirectMiddleware = (request: NextRequest) => {
	// Checks if the language and country in the URL are supported, and redirects to the best locale if not.
	const segments = request.nextUrl.pathname.split('/');
	const pathnameLanguage = getLanguageFromPathname(request.nextUrl.pathname);
	const detectedCountry = segments.at(2) ?? '';

	const pathnameIsMissingLanguage = !pathnameLanguage;
	const pathnameIsMissingCountry = !websiteRegions.includes(detectedCountry as WebsiteRegion);

	if (pathnameIsMissingCountry || pathnameIsMissingLanguage) {
		let { language, region } = findBestLocale(request);
		language = pathnameIsMissingLanguage ? language : pathnameLanguage;
		region = pathnameIsMissingCountry ? region : (detectedCountry as WebsiteRegion);

		const url = request.nextUrl.clone();
		url.pathname =
			`/${language}/${region}` +
			(pathnameIsMissingLanguage && segments.at(1) ? `/${segments.at(1)}` : '') +
			(pathnameIsMissingCountry && segments.at(2) ? `/${segments.at(2)}` : '') +
			`/${segments.slice(3).join('/')}`;

		return NextResponse.redirect(url);
	}
};

export const proxy = (request: NextRequest) =>
	i18nRedirectMiddleware(request) ?? currencyMiddleware(request, NextResponse.next());
