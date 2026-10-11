import { resultFail, resultOk, type Result } from '@/lib/result';
import {
	apiPlugin,
	StoryblokClient,
	storyblokInit,
	type ISbResult,
	type ISbStoriesParams,
	type StoryblokClient as StoryblokClientType,
} from '@storyblok/js';
import { createStoryblokFixtureClient } from './storyblok-fixture.integration';

export type StoryblokContentClient = Pick<StoryblokClientType, 'get' | 'getAll'>;

let storyblokApi: StoryblokContentClient | undefined;

export const fetchStoryblokStory = async <T>(slug: string, params: ISbStoriesParams): Promise<Result<T>> => {
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

export const fetchStoryblokStories = async <T>(params: ISbStoriesParams): Promise<Result<T[]>> => {
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
): Promise<Result<{ stories: T[]; total: number }>> => {
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

export const fetchPublishedStoryblokArticles = async <T>(params: ISbStoriesParams): Promise<Result<T[]>> => {
	if (process.env.E2E_STORYBLOK_MOCK === '1') {
		return fetchStoryblokStories<T>(params);
	}

	try {
		const accessToken = process.env.STORYBLOK_PREVIEW_TOKEN;
		if (!accessToken) {
			return resultFail('Storyblok preview token is not configured');
		}

		const client = new StoryblokClient({
			// Storyblok's SDK keeps the latest content version in module-global state keyed
			// by token. Use a feed-only namespace and restore the real token on the wire so
			// overlapping RSS reads cannot advance the shared application client's cv.
			accessToken: `journal-rss:${accessToken}`,
			cache: { type: 'none', cv: 'manual' },
			...(process.env.STORYBLOK_API_ENDPOINT ? { endpoint: process.env.STORYBLOK_API_ENDPOINT } : {}),
			fetch: async (input, options) => {
				const requestUrl = toRequestUrl(input);
				requestUrl.searchParams.set('token', accessToken);

				return fetch(requestUrl, options);
			},
		});
		const firstResponse = await client.get('cdn/stories', {
			...params,
			page: 1,
			cv: Date.now(),
		});
		const firstPage = getStoriesPage<T>(firstResponse);
		if (!firstPage) {
			return resultFail('Storyblok returned an invalid published articles response');
		}

		const perPage = firstResponse.perPage > 0 ? firstResponse.perPage : (params.per_page ?? firstPage.stories.length ?? 1);
		const pageCount = firstResponse.total > 0 ? Math.ceil(firstResponse.total / perPage) : 1;
		const stories = [...firstPage.stories];
		for (let page = 2; page <= pageCount; page += 1) {
			const response = await client.get('cdn/stories', {
				...params,
				page,
				cv: firstPage.cv,
			});
			const result = getStoriesPage<T>(response);
			if (!result) {
				return resultFail('Storyblok returned an invalid published articles response');
			}
			stories.push(...result.stories);
		}

		return resultOk(stories);
	} catch (error) {
		console.error('Could not fetch published Storyblok articles', { error });

		return resultFail('Could not fetch published Storyblok articles', getErrorStatus(error));
	}
};

export const fetchStoryblokDatasourceEntries = async <T>(params: ISbStoriesParams): Promise<Result<T[]>> => {
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

export const fetchStoryblokLinks = async <T>(params: ISbStoriesParams): Promise<Result<T[]>> => {
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

const toRequestUrl = (input: RequestInfo | URL): URL => {
	if (typeof input === 'string') {
		return new URL(input);
	}
	if (input instanceof URL) {
		return new URL(input.href);
	}

	return new URL(input.url);
};

const isExpectedValue = <T>(value: unknown): value is T => value !== undefined;

const isExpectedArray = <T>(value: unknown): value is T[] => Array.isArray(value) && value.every(isExpectedValue<T>);

const isStoryResponse = <T>(value: unknown): value is { story: T } =>
	isRecord(value) && 'story' in value && isExpectedValue<T>(value.story);

const isStoriesPageResponse = <T>(value: unknown): value is { stories: T[] } =>
	isRecord(value) && isExpectedArray<T>(value.stories);

const getStoriesPage = <T>(response: ISbResult): { stories: T[]; cv: number } | undefined => {
	if (!isRecord(response.data) || !isExpectedArray<T>(response.data.stories) || typeof response.data.cv !== 'number') {
		return undefined;
	}

	return { stories: response.data.stories, cv: response.data.cv };
};

const getErrorStatus = (error: unknown): number | undefined => {
	if (!isRecord(error) || typeof error.status !== 'number') {
		return undefined;
	}

	return error.status;
};
