import type { ISbStoryData } from '@storyblok/js';
import { createStoryblokFixtureClient } from './storyblok-fixture-client';

type StoryPayload = { story: ISbStoryData };
type StoriesPayload = { stories: ISbStoryData[] };

describe('createStoryblokFixtureClient', () => {
	const client = createStoryblokFixtureClient();

	it('returns fixture stories for e2e-critical paths', async () => {
		const layout = await client.get('cdn/stories/globals/layout');
		const home = await client.get('cdn/stories/pages/home');
		const coreProgram = await client.get('cdn/stories/pages/programs/sierra-leone-core-program');
		const skillsProgram = await client.get('cdn/stories/pages/programs/skills-program');

		const layoutStory = (layout.data as StoryPayload).story;
		const homeStory = (home.data as StoryPayload).story;
		const coreProgramStory = (coreProgram.data as StoryPayload).story;
		const skillsProgramStory = (skillsProgram.data as StoryPayload).story;

		const homeBlocks = homeStory.content.content as { component: string }[];

		expect(layoutStory.content.component).toBe('layout');
		expect(homeStory.content.component).toBe('page');
		expect(homeBlocks[0]?.component).toBe('heroVideo');
		expect(coreProgramStory.content.portalSlug).toBe('sierra-leone-core-program');
		expect(skillsProgramStory.content.portalSlug).toBe('skills-program');
	});

	it('throws for unknown story paths so service soft-fallbacks can catch', async () => {
		await expect(client.get('cdn/stories/pages/unknown')).rejects.toThrow(
			'Storyblok fixture not found for story path: pages/unknown',
		);
	});

	it('returns empty collections for list and getAll endpoints', async () => {
		const stories = await client.get('cdn/stories', { starts_with: 'pages/programs/' });
		const all = await client.getAll('cdn/stories', { starts_with: 'pages/campaigns/' });

		expect((stories.data as StoriesPayload).stories).toEqual([]);
		expect(stories.total).toBe(0);
		expect(all).toEqual([]);
	});
});
