import { HeroVideoBlockServer } from '@/components/content-blocks/hero-video-server';
import { ImageTextBlock } from '@/components/content-blocks/image-text';
import { ModalCardsBlock } from '@/components/content-blocks/modal-cards';
import { TextBlock } from '@/components/content-blocks/text';
import PageContentType from '@/components/content-types/page';
import { mockStoryblokIfTestMode } from '@/lib/services/storyblok/storyblok.mock';
import { apiPlugin, storyblokInit } from '@storyblok/react';

mockStoryblokIfTestMode();

/**
 * Storyblok component registry mapping component names to React components.
 */
export const storyblokComponents = {
	page: PageContentType,
	heroVideo: HeroVideoBlockServer,
	text: TextBlock,
	imageText: ImageTextBlock,
	modalCards: ModalCardsBlock,
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
