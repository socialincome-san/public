import type { ISbResult, ISbStoryData, StoryblokClient } from '@storyblok/js';
import layoutStory from '../../../../test/e2e/fixtures/storyblok/globals-layout';
import homeStory from '../../../../test/e2e/fixtures/storyblok/pages-home';
import sierraLeoneCoreProgramStory from '../../../../test/e2e/fixtures/storyblok/pages-programs-sierra-leone-core-program';
import skillsProgramStory from '../../../../test/e2e/fixtures/storyblok/pages-programs-skills-program';

const STORY_FIXTURES: Record<string, ISbStoryData> = {
	'globals/layout': layoutStory as unknown as ISbStoryData,
	'pages/home': homeStory as unknown as ISbStoryData,
	'pages/programs/sierra-leone-core-program': sierraLeoneCoreProgramStory as unknown as ISbStoryData,
	'pages/programs/skills-program': skillsProgramStory as unknown as ISbStoryData,
};

const emptyStoriesResult = (): ISbResult =>
	({
		data: { stories: [] },
		headers: {},
		total: 0,
		perPage: 0,
	}) as ISbResult;

const storyResult = (story: ISbStoryData): ISbResult =>
	({
		data: { story },
		headers: {},
	}) as ISbResult;

const storyPathFromSlug = (slug: string): string => {
	const normalized = slug.replace(/^\/+/, '');
	if (normalized.startsWith('cdn/stories/')) {
		return normalized.slice('cdn/stories/'.length);
	}

	return normalized;
};

/**
 * Minimal Storyblok CDN client for Playwright e2e.
 * Only the story paths required by current e2e routes are fixture-backed;
 * list/count endpoints return empty collections so soft fallbacks still work.
 */
export const createStoryblokFixtureClient = (): StoryblokClient => {
	const get = (slug: string): Promise<ISbResult> => {
		if (slug === 'cdn/stories' || slug === 'cdn/datasource_entries' || slug === 'cdn/links') {
			return Promise.resolve(emptyStoriesResult());
		}

		if (slug.startsWith('cdn/stories/')) {
			const storyPath = storyPathFromSlug(slug);
			const story = STORY_FIXTURES[storyPath];
			if (!story) {
				return Promise.reject(new Error(`Storyblok fixture not found for story path: ${storyPath}`));
			}

			return Promise.resolve(storyResult(story));
		}

		return Promise.reject(new Error(`Unsupported Storyblok fixture endpoint: ${slug}`));
	};

	const getAll = (): Promise<ISbStoryData[]> => Promise.resolve([]);

	return {
		get,
		getAll,
	} as unknown as StoryblokClient;
};
