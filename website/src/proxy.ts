import {
	findBestLocale,
	isWebsiteLanguage,
	parseCurrencySegment,
	toCurrencySegment,
	type WebsiteCurrency,
} from '@/lib/i18n/utils';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
	matcher: [
		// Skip internal paths (_next)
		'/((?!api|_next/static|_next/image|assets|fonts|favicon.ico|sw.js|portal|partner-space|v1/api-docs|openapi.json|sitemap.xml|robots.txt|llms.txt).*)',
	],
};

// URLs before the currency replaced the region segment.
const legacyRegionCurrencies = new Map<string, WebsiteCurrency>([
	['ch', 'CHF'],
	['int', 'USD'],
]);

const redirectToPath = (request: NextRequest, pathname: string, status: 307 | 308) => {
	const url = request.nextUrl.clone();
	url.pathname = pathname;

	return NextResponse.redirect(url, status);
};

/**
 * The URL is the only source of language and currency. A complete prefix passes through; old region and
 * upper-case currency segments redirect permanently; any other path gets the visitor's best locale in front.
 */
export const proxy = (request: NextRequest) => {
	const { pathname } = request.nextUrl;
	const [, language = '', segment = ''] = pathname.split('/');

	if (!isWebsiteLanguage(language)) {
		const best = findBestLocale(request);

		return redirectToPath(
			request,
			`/${best.language}/${toCurrencySegment(best.currency)}${pathname}`.replace(/\/$/, ''),
			307,
		);
	}

	if (parseCurrencySegment(segment)) {
		return NextResponse.next();
	}

	const afterLanguage = pathname.slice(language.length + 1);
	const knownCurrency = legacyRegionCurrencies.get(segment.toLowerCase()) ?? parseCurrencySegment(segment.toLowerCase());
	if (knownCurrency) {
		return redirectToPath(
			request,
			`/${language}/${toCurrencySegment(knownCurrency)}${afterLanguage.slice(segment.length + 1)}`,
			308,
		);
	}

	return redirectToPath(request, `/${language}/${toCurrencySegment(findBestLocale(request).currency)}${afterLanguage}`, 307);
};
