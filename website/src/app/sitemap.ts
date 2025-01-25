import { MetadataRoute } from 'next';
import { mainWebsiteLanguages, websiteRegions } from '@/i18n';

export const BASE_URL = process.env.BASE_URL || 'https://socialincome.org';

export default function sitemap(): MetadataRoute.Sitemap {
	const pages = ['', 'about-us', 'our-work'];

	return pages.flatMap((page) => (
        mainWebsiteLanguages.flatMap((lang) => ({
            url: `${BASE_URL}/${lang}/ch/${page}`,
            lastModified: new Date(),
        }),
    )));
	// return pages.flatMap((page) =>
	// 	mainWebsiteLanguages.flatMap((lang) =>
	// 		websiteRegions.map((region) => ({
	// 			url: `${BASE_URL}/${lang}/${region}/${page}`,
	// 			lastModified: new Date(),
	// 		})),
	// 	),
	// );
}

// export default function sitemap(): MetadataRoute.Sitemap {
// 	const pages = ['', 'about-us', 'our-work'];

// 	return [
// 		{
// 			url: 'https://socialincome.org',
// 			lastModified: new Date(),
// 			changeFrequency: 'yearly',
// 			priority: 1,
// 		},
// 		{
// 			url: 'https://socialincome.org/about',
// 			lastModified: new Date(),
// 			changeFrequency: 'monthly',
// 			priority: 0.8,
// 		},
// 		{
// 			url: 'https://socialincome.org/blog',
// 			lastModified: new Date(),
// 			changeFrequency: 'weekly',
// 			priority: 0.5,
// 		},
// 	];
// }
