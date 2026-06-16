import { websiteRegions } from '@/lib/i18n/utils';

export const revalidate = 86400;

const SITE_URL = 'https://socialincome.org';

const disallow = [
	'/portal/',
	'/partner-space/',
	'/api/',
	...websiteRegions.flatMap((region) => [
		`/*/${region}/dashboard/`,
		`/*/${region}/auth/`,
		`/*/${region}/preview`,
		`/*/${region}/*/preview`,
		`/*/${region}/*/*/preview`,
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
