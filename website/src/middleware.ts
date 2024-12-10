import { CURRENCY_COOKIE } from '@/app/[lang]/[region]';
import { WebsiteLanguage, WebsiteRegion, allWebsiteLanguages, findBestLocale, websiteRegions } from '@/i18n';
import { CountryCode } from '@socialincome/shared/src/types/country';
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
	// We use the country code from the request header if available. If not, we use the region/country from the url path.
	const requestCountry = request.geo?.country || request.nextUrl.pathname.split('/').at(2)?.toUpperCase();
	const currency = bestGuessCurrency(requestCountry as CountryCode);
	response.cookies.set({ name: CURRENCY_COOKIE, value: currency, path: '/', maxAge: 60 * 60 * 24 * 365 }); // 1 year
	return response;
};
export const redirectMiddleware = (request: NextRequest) => {
	switch (request.nextUrl.pathname) {
		case '/twint':
			return NextResponse.redirect('https://donate.raisenow.io/dpbdp');
		case '/erklaert':
			return NextResponse.redirect('https://vimeo.com/randominstitute/erklaert');
		case '/privacy':
			return NextResponse.redirect('https://socialincome.org/legal/privacy');
		case '/terms-and-conditions':
			return NextResponse.redirect('https://socialincome.org/legal/donations');
		case '/terms-of-use':
			return NextResponse.redirect('https://socialincome.org/legal/site-use');
		case '/explained':
			return NextResponse.redirect('https://vimeo.com/randominstitute/socialincome');
		case '/press':
			return NextResponse.redirect('https://sites.google.com/socialincome.org/press-archive');
		case '/newsletter-archive':
			return NextResponse.redirect('https://github.com/orgs/socialincome-san/discussions/categories/monthly-updates');
		case '/github':
			return NextResponse.redirect('https://github.com/socialincome-san/public');
		case '/world-poverty-statistics-2022':
		case '/world-poverty-statistics-2023':
			return NextResponse.redirect(new URL('/world-poverty-statistics-2024', request.url));
		case '/ismatu':
			return NextResponse.redirect('https://socialincome.org/campaign/MZmXEVHlDjOOFOMk82jW');
		case '/liberty':
			return NextResponse.redirect('https://socialincome.org/campaign/GCEvyQGKmBK5LgQO4oby');
		case '/thinkcell':
			return NextResponse.redirect('https://socialincome.webdisc.ch/');
	}
};

export const i18nRedirectMiddleware = (request: NextRequest) => {
	// Checks if the language and country in the URL are supported, and redirects to the best locale if not.
	const segments = request.nextUrl.pathname.split('/');
	const detectedLanguage = segments.at(1) ?? '';
	const detectedCountry = segments.at(2) ?? '';

	const pathnameIsMissingLanguage = !allWebsiteLanguages.includes(detectedLanguage as WebsiteLanguage);
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
	let response = redirectMiddleware(request) || i18nRedirectMiddleware(request);
	if (response) return response;

	response = NextResponse.next();
	response = currencyMiddleware(request, response);
	return response;
}
