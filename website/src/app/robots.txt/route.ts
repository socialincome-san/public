import { toCurrencySegment, websiteCurrencies } from '@/lib/i18n/utils';
import { WEBSITE_ORIGIN } from '@/lib/utils/metadata-image';

const disallow = [
	'/portal/',
	'/partner-space/',
	'/api/',
	...websiteCurrencies
		.map(toCurrencySegment)
		.flatMap((currency) => [
			`/*/${currency}/dashboard/`,
			`/*/${currency}/auth/`,
			`/*/${currency}/preview`,
			`/*/${currency}/*/preview`,
			`/*/${currency}/*/*/preview`,
		]),
];

const robotsTxt = [
	'User-Agent: *',
	...disallow.map((path) => `Disallow: ${path}`),
	'',
	`Sitemap: ${WEBSITE_ORIGIN}/sitemap.xml`,
].join('\n');

export const GET = () =>
	new Response(robotsTxt, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
