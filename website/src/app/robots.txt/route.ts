import { toCurrencySegment, websiteCurrencies } from '@/lib/i18n/utils';

const SITE_URL = 'https://socialincome.org';

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
	`Sitemap: ${SITE_URL}/sitemap.xml`,
].join('\n');

export const GET = () =>
	new Response(robotsTxt, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
