import { buildFaqSelectionBlok } from '@/components/campaign/campaign-blok-builders';
import { FaqSelectionBlock } from '@/components/content-blocks/faq-selection';
import type { Faq } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	heading: string;
	faqs: ISbStoryData<Faq>[];
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CampaignFaqSection = ({ heading, faqs, lang, region }: Props) => (
	<FaqSelectionBlock blok={buildFaqSelectionBlok(heading, faqs)} lang={lang} region={region} />
);
