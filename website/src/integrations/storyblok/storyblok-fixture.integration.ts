import type { ISbResult, ISbStoryData } from '@storyblok/js';
import layoutStory from '../../../test/e2e/fixtures/storyblok/globals-layout';
import homeStory from '../../../test/e2e/fixtures/storyblok/pages-home';
import sierraLeoneCoreProgramStory from '../../../test/e2e/fixtures/storyblok/pages-programs-sierra-leone-core-program';
import skillsProgramStory from '../../../test/e2e/fixtures/storyblok/pages-programs-skills-program';
import type { StoryblokContentClient } from './storyblok-content.integration';

const STORY_FIXTURES: Record<string, unknown> = {
	'globals/layout': layoutStory,
	'pages/home': homeStory,
	'pages/programs/sierra-leone-core-program': sierraLeoneCoreProgramStory,
	'pages/programs/skills-program': skillsProgramStory,
};

const emptyStoriesResult = (): ISbResult => ({
	data: { stories: [] },
	headers: new Headers(),
	total: 0,
	perPage: 0,
});

const storyResult = (story: ISbStoryData): ISbResult => ({
	data: { story },
	headers: new Headers(),
	total: 1,
	perPage: 1,
});

const storyPathFromSlug = (slug: string): string => {
	const normalized = slug.replace(/^\/+/, '');
	if (normalized.startsWith('cdn/stories/')) {
		return normalized.slice('cdn/stories/'.length);
	}

	return normalized;
};

export const createStoryblokFixtureClient = (): StoryblokContentClient => {
	const get = (slug: string): Promise<ISbResult> => {
		if (slug === 'cdn/stories' || slug === 'cdn/datasource_entries' || slug === 'cdn/links') {
			return Promise.resolve(emptyStoriesResult());
		}
		if (slug.startsWith('cdn/stories/')) {
			const storyPath = storyPathFromSlug(slug);
			const story = STORY_FIXTURES[storyPath];
			if (!isStoryblokStory(story)) {
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
	};
};

const isStoryblokStory = (input: unknown): input is ISbStoryData =>
	typeof input === 'object' && input !== null && 'content' in input && typeof input.content === 'object';
