import type { Campaign } from '@/generated/storyblok/types/109655/storyblok-components';
import type { CampaignPage } from '@/lib/services/campaign/campaign.types';
import type { ISbStoryData } from '@storyblok/js';

export type CampaignStory = ISbStoryData<Campaign>;

export type CampaignDetailData = {
	title: string;
	description: string;
	fullSlug: string;
	campaign: CampaignPage;
};
