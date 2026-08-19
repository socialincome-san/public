import { getStoryblokCampaignTitleForSlug } from '@/components/storyblok/campaign/campaign.utils';
import type { Campaign } from '@/generated/storyblok/types/109655/storyblok-components';
import { defaultLanguage } from '@/lib/i18n/utils';
import { getStoryblokApi } from '@/lib/services/storyblok/storyblok.config';
import { STORYBLOK_CAMPAIGNS_FOLDER } from '@/lib/storyblok/storyblok-paths';
import type { ISbStoriesParams, ISbStoryData } from '@storyblok/js';

const isListedCampaignStory = (story: unknown): story is ISbStoryData<Campaign> => {
	if (!story || typeof story !== 'object' || !('content' in story)) {
		return false;
	}

	const { content } = story as { content?: unknown };
	if (!content || typeof content !== 'object') {
		return false;
	}

	const campaign = content as Campaign;

	return campaign.component?.toLowerCase() === 'campaign' && campaign.public === true && campaign.approved === true;
};

const fetchCampaignStories = async (version: ISbStoriesParams['version']) => {
	const stories = await getStoryblokApi().getAll('cdn/stories', {
		language: defaultLanguage,
		version,
		starts_with: `${STORYBLOK_CAMPAIGNS_FOLDER}/`,
	});

	return stories.filter(isListedCampaignStory);
};

export const getCampaignTitleForSlug = async (slug: string): Promise<string> => {
	let campaigns = await fetchCampaignStories('published');
	if (campaigns.length === 0) {
		campaigns = await fetchCampaignStories('draft');
	}

	return getStoryblokCampaignTitleForSlug(campaigns, slug);
};
