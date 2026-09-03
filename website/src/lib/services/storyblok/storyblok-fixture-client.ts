import type { ISbResult, ISbStoriesParams, ISbStoryData, StoryblokClient } from '@storyblok/js';
import layoutStory from '../../../../test/e2e/fixtures/storyblok/globals-layout.json';
import homeStory from '../../../../test/e2e/fixtures/storyblok/pages-home.json';
import sierraLeoneCoreProgramStory from '../../../../test/e2e/fixtures/storyblok/pages-programs-sierra-leone-core-program.json';
import skillsProgramStory from '../../../../test/e2e/fixtures/storyblok/pages-programs-skills-program.json';

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
	const get = async (slug: string, _params?: ISbStoriesParams): Promise<ISbResult> => {
		if (slug === 'cdn/stories' || slug === 'cdn/datasource_entries' || slug === 'cdn/links') {
			return emptyStoriesResult();
		}

		if (slug.startsWith('cdn/stories/')) {
			const storyPath = storyPathFromSlug(slug);
			const story = STORY_FIXTURES[storyPath];
			if (!story) {
				throw new Error(`Storyblok fixture not found for story path: ${storyPath}`);
			}

			return storyResult(story);
		}

		throw new Error(`Unsupported Storyblok fixture endpoint: ${slug}`);
	};

	const getAll = async (_slug: string, _params?: ISbStoriesParams): Promise<ISbStoryData[]> => {
		return [];
	};

	return {
		get,
		getAll,
	} as StoryblokClient;
};
