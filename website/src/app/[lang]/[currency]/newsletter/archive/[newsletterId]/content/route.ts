import {
	getNewsletterArchiveEntry,
	prepareNewsletterHtml,
} from '@/app/[lang]/[currency]/newsletter/archive/newsletter-archive';
import { isWebsiteLanguage, parseCurrencySegment } from '@/lib/i18n/utils';

type RouteContext = {
	params: Promise<{ lang: string; currency: string; newsletterId: string }>;
};

const newsletterContentSecurityPolicy = [
	"default-src 'none'",
	'img-src https: data:',
	"style-src 'unsafe-inline' https:",
	'font-src https: data:',
	'media-src https: data:',
	"script-src 'none'",
	"connect-src 'none'",
	"object-src 'none'",
	"base-uri 'none'",
	"form-action 'none'",
	"frame-ancestors 'self'",
].join('; ');

export const GET = async (_request: Request, { params }: RouteContext) => {
	const { lang, currency, newsletterId } = await params;
	const parsedCurrency = parseCurrencySegment(currency);
	if (!isWebsiteLanguage(lang) || !parsedCurrency) {
		return new Response('Not found', { status: 404 });
	}

	const entry = await getNewsletterArchiveEntry(newsletterId);
	if (!entry) {
		return new Response('Not found', { status: 404 });
	}

	const html = prepareNewsletterHtml(entry.html);

	return new Response(html, {
		headers: {
			'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
			'Content-Security-Policy': newsletterContentSecurityPolicy,
			'Content-Type': 'text/html; charset=utf-8',
			'Referrer-Policy': 'no-referrer',
			'X-Content-Type-Options': 'nosniff',
		},
	});
};
