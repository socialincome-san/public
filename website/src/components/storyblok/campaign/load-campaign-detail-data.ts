import type { Campaign } from '@/generated/storyblok/types/109655/storyblok-components';
import type { CampaignPage } from '@/lib/services/campaign/campaign.types';
import { services } from '@/lib/services/services';
import type { ISbStoryData } from '@storyblok/js';

export type CampaignDetailData = {
	title: string;
	description: string;
	fullSlug: string;
	campaign: CampaignPage;
};

export type CampaignStory = ISbStoryData<Campaign>;

const getPortalSlug = (content: Campaign): string | undefined => {
	const slug = content.portalSlug?.trim();
	return slug || undefined;
};

export const loadCampaignDetailData = async (
	urlSlug: string,
	lang: string,
): Promise<CampaignDetailData | null> => {
	const storyResult = await services.storyblok.getCampaignBySlug(urlSlug, lang);
	if (!storyResult.success) {
		return null;
	}

	const story = storyResult.data;
	const portalSlug = getPortalSlug(story.content);
	if (!portalSlug) {
		return null;
	}

	const campaignResult = await services.read.campaign.getByPortalSlug(portalSlug);
	if (!campaignResult.success || !campaignResult.data) {
		return null;
	}

	return {
		title: story.content.title,
		description: story.content.description,
		fullSlug: story.full_slug,
		campaign: campaignResult.data,
	};
};
