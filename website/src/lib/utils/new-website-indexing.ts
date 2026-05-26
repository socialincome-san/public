import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import type { Metadata } from 'next';

export const isProdAppEnvironment = () => process.env.NEXT_PUBLIC_APP_ENVIRONMENT === 'prod';

/** Block search indexing for the pre-launch new website on production only. */
export const newWebsiteNoIndexMetadata = (): Metadata => ({
	robots: {
		index: false,
		follow: false,
		nocache: true,
		googleBot: {
			index: false,
			follow: false,
			noimageindex: true,
		},
	},
});

export const newWebsiteRobotsTxtDisallowPaths = (): string[] => [`/*/*/${NEW_WEBSITE_SLUG}`, `/*/*/${NEW_WEBSITE_SLUG}/`];

export const newWebsiteXRobotsTag = 'noindex, nofollow, noarchive, nosnippet';
