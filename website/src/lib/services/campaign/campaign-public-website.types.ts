import type { Faq } from '@/generated/storyblok/types/109655/storyblok-components';
import type { Translator } from '@/lib/i18n/translator';
import type { ISbStoryData } from '@storyblok/js';

export type CampaignNewsletterContent = {
	title: string;
	senderName: string;
	imageSrc: string | null;
	imageAlt: string;
};

export type CampaignPageContent = {
	translator: Translator;
	faqs: ISbStoryData<Faq>[];
	videoPlaybackIds: string[];
	newsletter: CampaignNewsletterContent;
};
