import { isProdAppEnvironment, newWebsiteRobotsTxtDisallowPaths } from '@/lib/utils/new-website-indexing';
import type { MetadataRoute } from 'next';

const SITEMAP_URL = 'https://socialincome.org/sitemap.xml';

export default function robots(): MetadataRoute.Robots {
	if (!isProdAppEnvironment()) {
		return {
			rules: {
				userAgent: '*',
				allow: '/',
			},
			sitemap: SITEMAP_URL,
		};
	}

	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: newWebsiteRobotsTxtDisallowPaths(),
		},
		sitemap: SITEMAP_URL,
	};
}
