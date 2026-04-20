import type { Campaign } from '@/generated/storyblok/types/109655/storyblok-components';
import type { CampaignStory } from './campaign.types';

export const getCampaignId = (campaign: Campaign) => {
	return campaign.id.trim();
};

export const getCampaignDescription = (campaign: Campaign) => {
	return campaign.description.trim();
};

export const getCampaignSlug = (campaign: CampaignStory) => {
	const fullSlugTail = campaign.full_slug?.split('/').at(-1);

	return fullSlugTail ?? campaign.slug;
};

export const getCampaignTitle = (campaign: Campaign) => {
	return campaign.title.trim() || getCampaignId(campaign);
};
