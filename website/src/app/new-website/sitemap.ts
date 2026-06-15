import { generateNewWebsiteSitemap } from '@/lib/sitemap/new-website-sitemap';
import type { MetadataRoute } from 'next';

export const revalidate = 86400;

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
	try {
		return await generateNewWebsiteSitemap();
	} catch (error) {
		console.error('Failed to generate new website sitemap', error);

		return [];
	}
};

export default sitemap;
