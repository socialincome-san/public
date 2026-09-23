import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { apiPlugin, storyblokInit, type ISbStoriesParams, type StoryblokClient } from '@storyblok/js';
import { createStoryblokFixtureClient } from './storyblok-fixture.integration';

export type StoryblokContentClient = Pick<StoryblokClient, 'get' | 'getAll'>;

let storyblokApi: StoryblokContentClient | undefined;

export const fetchStoryblokStory = async <T>(slug: string, params: ISbStoriesParams): Promise<ServiceResult<T>> => {
	try {
		const response = await getStoryblokContentClient().get(`cdn/stories/${slug}`, params);
		const data: unknown = response.data;
		if (!isStoryResponse<T>(data)) {
			return resultFail('Storyblok returned an invalid story response');
		}

		return resultOk(data.story);
	} catch (error) {
		console.error('Could not fetch Storyblok story', { slug, error });

		return resultFail('Could not fetch Storyblok story', getErrorStatus(error));
	}
};

export const fetchStoryblokStories = async <T>(params: ISbStoriesParams): Promise<ServiceResult<T[]>> => {
	try {
		const stories: unknown = await getStoryblokContentClient().getAll('cdn/stories', params);
		if (!isExpectedArray<T>(stories)) {
			return resultFail('Storyblok returned an invalid stories response');
		}

		return resultOk(stories);
	} catch (error) {
		console.error('Could not fetch Storyblok stories', { error });

		return resultFail('Could not fetch Storyblok stories', getErrorStatus(error));
	}
};

export const fetchStoryblokStoriesPage = async <T>(
	params: ISbStoriesParams,
): Promise<ServiceResult<{ stories: T[]; total: number }>> => {
	try {
		const response = await getStoryblokContentClient().get('cdn/stories', params);
		const data: unknown = response.data;
		if (!isStoriesPageResponse<T>(data) || typeof response.total !== 'number') {
			return resultFail('Storyblok returned an invalid stories response');
		}

		return resultOk({ stories: data.stories, total: response.total });
	} catch (error) {
		console.error('Could not fetch Storyblok stories page', { error });

		return resultFail('Could not fetch Storyblok stories', getErrorStatus(error));
	}
};

export const fetchStoryblokDatasourceEntries = async <T>(params: ISbStoriesParams): Promise<ServiceResult<T[]>> => {
	try {
		const entries: unknown = await getStoryblokContentClient().getAll('cdn/datasource_entries', params);
		if (!isExpectedArray<T>(entries)) {
			return resultFail('Storyblok returned an invalid datasource response');
		}

		return resultOk(entries);
	} catch (error) {
		console.error('Could not fetch Storyblok datasource entries', { error });

		return resultFail('Could not fetch Storyblok datasource entries', getErrorStatus(error));
	}
};

export const fetchStoryblokLinks = async <T>(params: ISbStoriesParams): Promise<ServiceResult<T[]>> => {
	try {
		const links: unknown = await getStoryblokContentClient().getAll('cdn/links', params);
		if (!isExpectedArray<T>(links)) {
			return resultFail('Storyblok returned an invalid links response');
		}

		return resultOk(links);
	} catch (error) {
		console.error('Could not fetch Storyblok links', { error });

		return resultFail('Could not fetch Storyblok links', getErrorStatus(error));
	}
};

const getStoryblokContentClient = (): StoryblokContentClient => {
	if (storyblokApi) {
		return storyblokApi;
	}

	if (process.env.E2E_STORYBLOK_MOCK === '1') {
		storyblokApi = createStoryblokFixtureClient();

		return storyblokApi;
	}

	const result = storyblokInit({
		accessToken: process.env.STORYBLOK_PREVIEW_TOKEN,
		use: [apiPlugin],
	});
	if (!result.storyblokApi) {
		throw new Error('Failed to initialize Storyblok API client');
	}

	storyblokApi = result.storyblokApi;

	return storyblokApi;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isExpectedValue = <T>(value: unknown): value is T => value !== undefined;

const isExpectedArray = <T>(value: unknown): value is T[] => Array.isArray(value) && value.every(isExpectedValue<T>);

const isStoryResponse = <T>(value: unknown): value is { story: T } =>
	isRecord(value) && 'story' in value && isExpectedValue<T>(value.story);

const isStoriesPageResponse = <T>(value: unknown): value is { stories: T[] } =>
	isRecord(value) && isExpectedArray<T>(value.stories);

const getErrorStatus = (error: unknown): number | undefined => {
	if (!isRecord(error) || typeof error.status !== 'number') {
		return undefined;
	}

	return error.status;
};
