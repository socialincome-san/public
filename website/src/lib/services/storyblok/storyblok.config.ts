import HeroVideoBlock from '@/components/content-blocks/hero-video';
import ImageTextBlock from '@/components/content-blocks/image-text';
import TextBlock from '@/components/content-blocks/text';
import PageContentType from '@/components/content-types/page';
import { apiPlugin, storyblokInit } from '@storyblok/react';

const MOCKSERVER_BASE_URL = 'http://localhost:1080';
const STORYBLOK_ORIGIN = 'https://api.storyblok.com';

// ✅ only patch when explicitly enabled
if (process.env.STORYBLOK_MOCK_MODE === 'record' || process.env.STORYBLOK_MOCK_MODE === 'replay') {
	console.log('[Storyblok Mock] global.fetch patch ENABLED');

	const originalFetch = global.fetch;

	global.fetch = async (input: RequestInfo, init?: RequestInit) => {
		const originalUrl = typeof input === 'string' ? input : input.url;

		let finalUrl = originalUrl;

		if (originalUrl.startsWith(STORYBLOK_ORIGIN)) {
			finalUrl = MOCKSERVER_BASE_URL + originalUrl.replace('https://', '/');

			console.log('[Storyblok Mock][FETCH]', {
				originalUrl,
				finalUrl,
			});
		}

		return originalFetch(finalUrl, init);
	};
} else {
	console.log('[Storyblok Mock] global.fetch patch DISABLED');
}

/**
 * Storyblok component registry mapping component names to React components.
 */
export const storyblokComponents = {
	page: PageContentType,
	heroVideo: HeroVideoBlock,
	text: TextBlock,
	imageText: ImageTextBlock,
};

/**
 * Initialize and return the Storyblok API client.
 */
export const getStoryblokApi = () => {
	return storyblokInit({
		accessToken: process.env.STORYBLOK_PREVIEW_TOKEN,
		use: [apiPlugin],
		components: storyblokComponents,
		enableFallbackComponent: true,
	})();
};
