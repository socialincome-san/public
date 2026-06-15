import { websiteRegions } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

export const revalidate = 86400;

const SITE_URL = 'https://socialincome.org';

const disallow = [
	'/portal/',
	'/partner-space/',
	'/api/',
	...websiteRegions.flatMap((region) => [
		`/*/${region}/dashboard/`,
		`/*/${region}/${NEW_WEBSITE_SLUG}/auth/`,
		`/*/${region}/${NEW_WEBSITE_SLUG}/preview`,
		`/*/${region}/${NEW_WEBSITE_SLUG}/*/preview`,
		`/*/${region}/${NEW_WEBSITE_SLUG}/*/*/preview`,
	]),
];

const robotsTxt = [
	'User-Agent: *',
	...disallow.map((path) => `Disallow: ${path}`),
	'',
	`Sitemap: ${SITE_URL}/${NEW_WEBSITE_SLUG}/sitemap.xml`,
].join('\n');

export const GET = () =>
	new Response(robotsTxt, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
