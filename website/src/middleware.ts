import { CURRENCY_COOKIE } from '@/app/[lang]/[region]';
import { WebsiteLanguage, WebsiteRegion, findBestLocale, websiteLanguages, websiteRegions } from '@/i18n';
import { NextRequest, NextResponse } from 'next/server';
import { bestGuessCurrency, isValidCurrency } from '../../shared/src/types/currency';

export const config = {
	matcher: [
		// Skip internal paths (_next)
		'/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)',
	],
};

export const currencyMiddleware = (request: NextRequest, response: NextResponse) => {
	// Checks if a valid currency is set as a cookie, and sets one with the best guess if not.
	if (request.cookies.has(CURRENCY_COOKIE) && isValidCurrency(request.cookies.get(CURRENCY_COOKIE)?.value))
		return response;
	const region = request.nextUrl.pathname.split('/').at(2);
	const currency = bestGuessCurrency(region);
	response.cookies.set({ name: CURRENCY_COOKIE, value: currency, path: '/', maxAge: 60 * 60 * 24 * 365 }); // 1 year
	return response;
};

export const i18nRedirectMiddleware = (request: NextRequest) => {
	// Checks if the language and country in the URL are supported, and redirects to the best locale if not.
	const segments = request.nextUrl.pathname.split('/');
	const detectedLanguage = segments.at(1) ?? '';
	const detectedCountry = segments.at(2) ?? '';

	const pathnameIsMissingLanguage = !websiteLanguages.includes(detectedLanguage as WebsiteLanguage);
	const pathnameIsMissingCountry = !websiteRegions.includes(detectedCountry as WebsiteRegion);

	if (pathnameIsMissingCountry || pathnameIsMissingLanguage) {
		let { language, region } = findBestLocale(request);
		language = pathnameIsMissingLanguage ? language : (detectedLanguage as WebsiteLanguage);
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

export function middleware(request: NextRequest) {
	let response = i18nRedirectMiddleware(request);
	if (response) return response;

	response = NextResponse.next();
	response = currencyMiddleware(request, response);
	return response;
}
