import { websiteRegions } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import type { MetadataRoute } from 'next';

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

const robots = (): MetadataRoute.Robots => ({
	rules: {
		userAgent: '*',
		disallow,
	},
	sitemap: `${SITE_URL}/${NEW_WEBSITE_SLUG}/sitemap.xml`,
});

export default robots;
