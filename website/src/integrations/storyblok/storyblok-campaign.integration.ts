import type { Campaign, CampaignGlobals } from '@/generated/storyblok/types/109655/storyblok-components';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { STORYBLOK_CAMPAIGN_GLOBALS_PATH, STORYBLOK_CAMPAIGNS_FOLDER } from '@/lib/storyblok/storyblok-paths';
import type { ISbStoriesParams, ISbStoryData } from '@storyblok/js';
import { fetchStoryblokStories, fetchStoryblokStory } from './storyblok-content.integration';

const CAMPAIGN_GLOBALS_RELATIONS = 'campaignGlobals.faq';

const isObjectRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const fetchStoryblokCampaignGlobals = async (
	language: string,
): Promise<ServiceResult<ISbStoryData<CampaignGlobals> | null>> => {
	try {
		const story = await fetchStoryWithLanguageFallback<CampaignGlobals>(
			STORYBLOK_CAMPAIGN_GLOBALS_PATH,
			language,
			CAMPAIGN_GLOBALS_RELATIONS,
		);

		return resultOk(story);
	} catch (error) {
		console.error('Could not fetch Storyblok campaign globals', { language, error });

		return resultFail('Could not fetch campaign page content');
	}
};

export const fetchStoryblokListedCampaigns = async (language: string): Promise<ServiceResult<ISbStoryData<Campaign>[]>> => {
	try {
		const params: ISbStoriesParams = {
			language,
			version: 'published',
			starts_with: `${STORYBLOK_CAMPAIGNS_FOLDER}/`,
		};
		const storiesResult = await fetchStoryblokStories<ISbStoryData<Campaign>>(params);
		if (!storiesResult.success) {
			return resultOk([]);
		}
		let campaigns = storiesResult.data.filter(isListedCampaignStory);
		if (campaigns.length === 0 && process.env.NODE_ENV !== 'production') {
			const draftStoriesResult = await fetchStoryblokStories<ISbStoryData<Campaign>>({
				...params,
				version: 'draft',
			});
			if (draftStoriesResult.success) {
				campaigns = draftStoriesResult.data.filter(isListedCampaignStory);
			}
		}

		return resultOk(campaigns);
	} catch (error) {
		console.error('Could not fetch Storyblok campaigns', { language, error });

		return resultOk([]);
	}
};

const fetchStoryWithLanguageFallback = async <T>(
	slug: string,
	language: string,
	resolveRelations: string,
): Promise<ISbStoryData<T> | null> => {
	try {
		return await fetchStory<T>(slug, language, resolveRelations);
	} catch (error: unknown) {
		if (!hasNotFoundStatus(error)) {
			throw error;
		}
		if (language === 'en') {
			return null;
		}

		try {
			return await fetchStory<T>(slug, 'en', resolveRelations);
		} catch (fallbackError: unknown) {
			if (hasNotFoundStatus(fallbackError)) {
				return null;
			}

			throw fallbackError;
		}
	}
};

const isStoryblokStoryData = <T>(value: unknown): value is ISbStoryData<T> => {
	if (!isObjectRecord(value) || !isObjectRecord(value.content)) {
		return false;
	}

	return typeof value.full_slug === 'string';
};

const fetchStory = async <T>(slug: string, language: string, resolveRelations: string): Promise<ISbStoryData<T>> => {
	const result = await fetchStoryblokStory<ISbStoryData<T>>(slug, {
		language,
		version: 'published',
		resolve_relations: resolveRelations,
	});
	if (!result.success) {
		const error = new Error(result.error);
		if (result.status !== undefined) {
			Object.defineProperty(error, 'status', { value: result.status });
		}
		throw error;
	}
	if (!isStoryblokStoryData<T>(result.data)) {
		throw new Error('Storyblok story response was invalid');
	}

	return result.data;
};

const isListedCampaignStory = (story: unknown): story is ISbStoryData<Campaign> => {
	if (!isObjectRecord(story) || !isObjectRecord(story.content)) {
		return false;
	}

	return story.content.component === 'Campaign' && story.content.public === true && story.content.approved === true;
};

const hasNotFoundStatus = (error: unknown): boolean => isObjectRecord(error) && 'status' in error && error.status === 404;
