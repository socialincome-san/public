import { DonationsTotalBlockServer } from '@/components/content-blocks/donations-total-server';
import { DownloadsBlock } from '@/components/content-blocks/downloads';
import { FaqSelectionBlock } from '@/components/content-blocks/faq-selection';
import { HeroVideoBlockServer } from '@/components/content-blocks/hero-video-server';
import { ImageTextBlock } from '@/components/content-blocks/image-text';
import { ImpactMeasurementBlock } from '@/components/content-blocks/impact-measurement';
import { JournalTeasersBlock } from '@/components/content-blocks/journal-teasers';
import { ModalCardsBlock } from '@/components/content-blocks/modal-cards';
import { PartnershipsCarouselBlock } from '@/components/content-blocks/partnerships-carousel';
import { ProgramGridBlock } from '@/components/content-blocks/program-grid';
import { TeamGridBlock } from '@/components/content-blocks/team-grid';
import { TestimonialCarouselBlock } from '@/components/content-blocks/testimonial-carousel';
import { TestimonialBlock } from '@/components/content-blocks/testimonial-entry';
import { TextBlock } from '@/components/content-blocks/text';
import { TwoColumnTextBlock } from '@/components/content-blocks/two-column-text';
import { VideoTextBlock } from '@/components/content-blocks/video-text';
import PageContentType from '@/components/content-types/page';
import { apiPlugin, storyblokInit } from '@storyblok/react';

/**
 * Storyblok component registry mapping component names to React components.
 */
const storyblokComponents = {
	page: PageContentType,
	donationsTotal: DonationsTotalBlockServer,
	downloads: DownloadsBlock,
	heroVideo: HeroVideoBlockServer,
	impactMeasurement: ImpactMeasurementBlock,
	text: TextBlock,
	faqSelection: FaqSelectionBlock,
	imageText: ImageTextBlock,
	modalCards: ModalCardsBlock,
	journalTeasers: JournalTeasersBlock,
	partnershipsCarousel: PartnershipsCarouselBlock,
	programGrid: ProgramGridBlock,
	teamGrid: TeamGridBlock,
	testimonialCarousel: TestimonialCarouselBlock,
	testimonial: TestimonialBlock,
	videoText: VideoTextBlock,
	twoColumnText: TwoColumnTextBlock,
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
