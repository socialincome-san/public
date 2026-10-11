import type { ISbResult, ISbStoryData } from '@storyblok/js';
import { createStoryblokFixtureClient } from './storyblok-fixture.integration';

describe('createStoryblokFixtureClient', () => {
	const client = createStoryblokFixtureClient();

	it('returns fixture stories for e2e-critical paths', async () => {
		const layout = await client.get('cdn/stories/globals/layout');
		const home = await client.get('cdn/stories/pages/home');
		const coreProgram = await client.get('cdn/stories/pages/programs/sierra-leone-core-program');
		const skillsProgram = await client.get('cdn/stories/pages/programs/skills-program');

		const layoutStory = getStory(layout);
		const homeStory = getStory(home);
		const coreProgramStory = getStory(coreProgram);
		const skillsProgramStory = getStory(skillsProgram);

		expect(getContentField(layoutStory, 'component')).toBe('layout');
		expect(getContentField(homeStory, 'component')).toBe('page');
		expect(getContentField(coreProgramStory, 'portalSlug')).toBe('sierra-leone-core-program');
		expect(getContentField(skillsProgramStory, 'portalSlug')).toBe('skills-program');
	});

	it('throws for unknown story paths so service soft-fallbacks can catch', async () => {
		await expect(client.get('cdn/stories/pages/unknown')).rejects.toThrow(
			'Storyblok fixture not found for story path: pages/unknown',
		);
	});

	it('returns empty collections for list and getAll endpoints', async () => {
		const stories = await client.get('cdn/stories', { starts_with: 'pages/programs/' });
		const all = await client.getAll('cdn/stories', { starts_with: 'pages/campaigns/' });

		expect(getStories(stories)).toEqual([]);
		expect(stories.total).toBe(0);
		expect(all).toEqual([]);
	});
});

const getStory = (result: ISbResult): ISbStoryData => {
	const data: unknown = result.data;
	if (typeof data !== 'object' || data === null || !('story' in data) || !isStoryblokStory(data.story)) {
		throw new Error('Expected a Storyblok story result');
	}

	return data.story;
};

const getStories = (result: ISbResult): unknown[] => {
	const data: unknown = result.data;
	if (typeof data !== 'object' || data === null || !('stories' in data) || !Array.isArray(data.stories)) {
		throw new Error('Expected a Storyblok stories result');
	}

	return data.stories;
};

const getContentField = (story: ISbStoryData, field: string): unknown => {
	const content: unknown = story.content;
	if (typeof content !== 'object' || content === null) {
		return undefined;
	}
	if (field === 'component' && 'component' in content) {
		return content.component;
	}
	if (field === 'portalSlug' && 'portalSlug' in content) {
		return content.portalSlug;
	}

	return undefined;
};

const isStoryblokStory = (input: unknown): input is ISbStoryData =>
	typeof input === 'object' && input !== null && 'content' in input && typeof input.content === 'object';
