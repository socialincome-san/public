import { getStoryblokCampaignTitleForSlug } from '@/components/storyblok/campaign/campaign.utils';
import type { Campaign } from '@/generated/storyblok/types/109655/storyblok-components';
import { fetchStoryblokStories } from '@/integrations/storyblok/storyblok-content.integration';
import { defaultLanguage } from '@/lib/i18n/utils';
import { STORYBLOK_CAMPAIGNS_FOLDER } from '@/lib/storyblok/storyblok-paths';
import type { ISbStoriesParams, ISbStoryData } from '@storyblok/js';

const isListedCampaignStory = (story: unknown): story is ISbStoryData<Campaign> => {
	if (!story || typeof story !== 'object' || !('content' in story)) {
		return false;
	}

	const { content } = story;
	if (!content || typeof content !== 'object') {
		return false;
	}
	if (!('component' in content) || !('public' in content) || !('approved' in content)) {
		return false;
	}

	return (
		typeof content.component === 'string' &&
		content.component.toLowerCase() === 'campaign' &&
		content.public === true &&
		content.approved === true
	);
};

const fetchCampaignStories = async (version: ISbStoriesParams['version']) => {
	const result = await fetchStoryblokStories<ISbStoryData<Campaign>>({
		language: defaultLanguage,
		version,
		starts_with: `${STORYBLOK_CAMPAIGNS_FOLDER}/`,
	});

	return result.success ? result.data.filter(isListedCampaignStory) : [];
};

export const getCampaignTitleForSlug = async (slug: string): Promise<string> => {
	if (!process.env.STORYBLOK_PREVIEW_TOKEN) {
		return slug;
	}

	try {
		let campaigns = await fetchCampaignStories('published');
		if (campaigns.length === 0) {
			campaigns = await fetchCampaignStories('draft');
		}

		return getStoryblokCampaignTitleForSlug(campaigns, slug);
	} catch {
		return slug;
	}
};
