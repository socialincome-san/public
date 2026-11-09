import { toCurrencySegment, websiteCurrencies } from '@/lib/i18n/utils';
import { WEBSITE_ORIGIN } from '@/lib/utils/metadata-image';
import { isProductionDeployment } from '@/lib/utils/robots';

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

const productionRobotsTxt = [
	'User-Agent: *',
	...disallow.map((path) => `Disallow: ${path}`),
	'',
	`Sitemap: ${WEBSITE_ORIGIN}/sitemap.xml`,
].join('\n');

// Crawlable on purpose: crawlers must fetch pages to see their `X-Robots-Tag: noindex` header, which keeps them out of
// search results. `Disallow: /` would hide it, and linked URLs could still be listed.
const nonProductionRobotsTxt = ['User-Agent: *', 'Disallow:'].join('\n');

export const GET = () =>
	new Response(isProductionDeployment() ? productionRobotsTxt : nonProductionRobotsTxt, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
