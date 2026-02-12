import HeroVideoBlock from '@/components/content-blocks/hero-video';
import ImageTextBlock from '@/components/content-blocks/image-text';
import TextBlock from '@/components/content-blocks/text';
import PageContentType from '@/components/content-types/page';
import { apiPlugin, storyblokInit } from '@storyblok/react';
import { mockStoryblokIfTestMode } from './storyblok.mock';

mockStoryblokIfTestMode();

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
