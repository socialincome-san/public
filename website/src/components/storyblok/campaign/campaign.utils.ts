import type { Campaign } from '@/generated/storyblok/types/109655/storyblok-components';
import type { CampaignStory } from './campaign.types';

export const getCampaignPortalSlug = (campaign: Campaign) => {
	return campaign.portalSlug?.trim() ?? '';
};

export const getCampaignStoryblokSlug = (campaign: CampaignStory) => {
	const fullSlugTail = campaign.full_slug?.split('/').at(-1);

	return fullSlugTail ?? campaign.slug;
};

export const getCampaignTitle = (campaign: Campaign) => {
	return campaign.title.trim() || getCampaignPortalSlug(campaign);
};
