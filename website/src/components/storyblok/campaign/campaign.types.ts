import type { HeroHeaderImage } from '@/components/storyblok/shared/hero-header';
import type { Campaign } from '@/generated/storyblok/types/109655/storyblok-components';
import type { CampaignPage } from '@/lib/services/campaign/campaign.types';
import type { ISbStoryData } from '@storyblok/js';

export type CampaignStory = ISbStoryData<Campaign>;

export type CampaignDetailData = {
	title: string;
	description: string;
	creatorName: string;
	quote: string;
	fullSlug: string;
	primaryImage?: HeroHeaderImage | null;
	profilePicture?: HeroHeaderImage | null;
	sectionDescription?: string;
	sectionImage?: HeroHeaderImage | null;
	instagramHandle?: string;
	xHandle?: string;
	tiktokHandle?: string;
	linkWebsite?: string;
	campaign: CampaignPage;
};
