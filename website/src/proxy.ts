import { COUNTRY_COOKIE, CURRENCY_COOKIE } from '@/app/[lang]/[region]';
import {
	findBestLocale,
	getLanguageFromPathname,
	WEBSITE_LANGUAGE_HEADER,
	WebsiteRegion,
	websiteRegions,
} from '@/lib/i18n/utils';
import { isValidCountryCode } from '@/lib/types/country';
import { NextRequest, NextResponse } from 'next/server';
import { CountryCode } from './generated/prisma/enums';
import { bestGuessCurrency, isValidCurrency } from './lib/types/currency';

// https://developers.cloudflare.com/fundamentals/reference/http-headers/#cf-ipcountry
const CLOUDFLARE_IP_COUNTRY_HEADER = 'cf-ipcountry';

export const config = {
	matcher: [
		// Skip internal paths (_next)
		'/((?!api|_next/static|_next/image|assets|fonts|favicon.ico|sw.js|portal|partner-space|v1/api-docs|openapi.json|sitemap.xml|robots.txt|llms.txt).*)',
	],
};

/**
 * Checks if a valid country is set as a cookie and set it based on the request header if available.
 */
const countryMiddleware = (request: NextRequest, response: NextResponse) => {
	const countryCookie = request.cookies.get(COUNTRY_COOKIE);
	if (countryCookie && isValidCountryCode(countryCookie.value)) {
		return response;
	}

	const country = request.headers.get(CLOUDFLARE_IP_COUNTRY_HEADER)?.toUpperCase();
	if (country) {
		response.cookies.set({
			name: COUNTRY_COOKIE,
			value: country,
			path: '/',
			maxAge: 60 * 60 * 24 * 7,
		});
	} // 1 week

	return response;
};

/**
 * Checks if a valid currency is set as a cookie, and sets one based on the country cookie if available.
 */
const currencyMiddleware = (request: NextRequest, response: NextResponse) => {
	if (request.cookies.has(CURRENCY_COOKIE) && isValidCurrency(request.cookies.get(CURRENCY_COOKIE)?.value)) {
		return response;
	}
	// We use the country code from the request header if available. If not, we use the region/country from the url path.
	const country =
		(response.cookies.get(COUNTRY_COOKIE)?.value as CountryCode | undefined) ??
		(request.cookies.get(COUNTRY_COOKIE)?.value as CountryCode | undefined);
	const currency = bestGuessCurrency(country);

	response.cookies.set({ name: CURRENCY_COOKIE, value: currency, path: '/', maxAge: 60 * 60 * 24 * 7 }); // 1 week

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

export const proxy = (request: NextRequest) => {
	let response = i18nRedirectMiddleware(request);
	if (response) {
		return response;
	}

	const requestHeaders = new Headers(request.headers);
	const language = getLanguageFromPathname(request.nextUrl.pathname);
	if (language) {
		requestHeaders.set(WEBSITE_LANGUAGE_HEADER, language);
	}

	response = NextResponse.next({ request: { headers: requestHeaders } });
	response = countryMiddleware(request, response);
	response = currencyMiddleware(request, response);

	return response;
};
