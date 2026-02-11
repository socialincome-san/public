import HeroVideoBlock from '@/components/content-blocks/hero-video';
import ImageTextBlock from '@/components/content-blocks/image-text';
import TextBlock from '@/components/content-blocks/text';
import PageContentType from '@/components/content-types/page';
import { apiPlugin, storyblokInit } from '@storyblok/react';
import { patchStoryblokFetch } from './storyblok.mock';

/**
 * Enable Storyblok mock in development and test environments when STORYBLOK_MOCK_MODE is set to 'record' or 'replay'.
 * In 'record' mode, Storyblok API calls are recorded and can be saved for later use.
 * In 'replay' mode, recorded API responses are replayed, allowing for consistent testing without hitting the real API.
 */
if (process.env.STORYBLOK_MOCK_MODE === 'record' || process.env.STORYBLOK_MOCK_MODE === 'replay') {
	console.log('[Storyblok Mock] Enabled via STORYBLOK_MOCK_MODE');
	patchStoryblokFetch();
} else {
	console.log('[Storyblok Mock] Disabled');
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
