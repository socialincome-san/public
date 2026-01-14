import HeroVideoBlock from '@/components/content-blocks/hero-video';
import TextBlock from '@/components/content-blocks/text';
import PageContentType from '@/components/content-types/page';
import { apiPlugin, storyblokInit } from '@storyblok/react';

const storyblokComponents = {
	page: PageContentType,
	heroVideo: HeroVideoBlock,
	text: TextBlock,
};

export const getStoryblokApi = () => {
	return storyblokInit({
		accessToken: process.env.STORYBLOK_PREVIEW_TOKEN,
		use: [apiPlugin],
		components: storyblokComponents,
		enableFallbackComponent: true,
	})();
};
