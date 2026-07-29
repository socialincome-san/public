import type { CampaignDetailData } from '@/components/storyblok/campaign/campaign.types';
import { getCampaignPortalSlug, getCampaignTitle } from '@/components/storyblok/campaign/campaign.utils';
import { services } from '@/lib/services/services';

export type { CampaignDetailData, CampaignStory } from '@/components/storyblok/campaign/campaign.types';

export const loadCampaignDetailData = async (urlSlug: string, lang: string): Promise<CampaignDetailData | null> => {
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
		fullSlug: story.full_slug,
		campaign: campaignResult.data,
	};
};
