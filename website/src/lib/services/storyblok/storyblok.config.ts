import { apiPlugin, storyblokInit, type StoryblokClient } from '@storyblok/js';
import { createStoryblokFixtureClient } from './storyblok-fixture-client';

let storyblokApi: StoryblokClient | undefined;

/**
 * Initialize and return the Storyblok API client.
 */
export const getStoryblokApi = () => {
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
