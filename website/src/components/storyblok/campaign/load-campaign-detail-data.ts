import type { CampaignDetailData } from '@/components/storyblok/campaign/campaign.types';
import { getCampaignPortalSlug, getCampaignTitle } from '@/components/storyblok/campaign/campaign.utils';
import { services } from '@/lib/services/services';
import { cache } from 'react';

export const loadCampaignDetailData = cache(async (urlSlug: string, lang: string): Promise<CampaignDetailData | null> => {
	const storyResult = await services.storyblok.getCampaignBySlug(urlSlug, lang);
	if (!storyResult.success) {
		return null;
	}

	const story = storyResult.data;
	const portalSlug = getCampaignPortalSlug(story.content);
	if (!portalSlug) {
		return null;
	}

	const campaignResult = await services.read.campaign.getByPortalSlug(portalSlug);
	if (!campaignResult.success || !campaignResult.data) {
		return null;
	}

	return {
		title: getCampaignTitle(story.content),
		description: story.content.description,
		creatorName: story.content.creatorName,
		quote: story.content.quote ?? '',
		fullSlug: story.full_slug,
		primaryImage: story.content.primaryImage,
		profilePicture: story.content.profilePicture,
		campaign: campaignResult.data,
	};
});
