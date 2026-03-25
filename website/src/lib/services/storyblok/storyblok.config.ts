import { FaqSelectionBlock } from '@/components/content-blocks/faq-selection';
import { HeroVideoBlockServer } from '@/components/content-blocks/hero-video-server';
import { ImageTextBlock } from '@/components/content-blocks/image-text';
import { JournalTeasersBlock } from '@/components/content-blocks/journal-teasers';
import { ModalCardsBlock } from '@/components/content-blocks/modal-cards';
import { TextBlock } from '@/components/content-blocks/text';
import PageContentType from '@/components/content-types/page';
import { mockStoryblokIfTestMode } from '@/lib/services/storyblok/storyblok.mock';
import { apiPlugin, storyblokInit } from '@storyblok/react';

mockStoryblokIfTestMode();

/**
 * Storyblok component registry mapping component names to React components.
 */
const storyblokComponents = {
	page: PageContentType,
	heroVideo: HeroVideoBlockServer,
	text: TextBlock,
	faqSelection: FaqSelectionBlock,
	imageText: ImageTextBlock,
	modalCards: ModalCardsBlock,
	journalTeasers: JournalTeasersBlock,
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
