import type { Faq } from '@/generated/storyblok/types/109655/storyblok-components';
import type { Translator } from '@/lib/i18n/translator';
import type { ISbStoryData } from '@storyblok/js';

export type CampaignPageContent = {
	translator: Translator;
	faqs: ISbStoryData<Faq>[];
};
