import { createStoryblokFixtureClient } from './storyblok-fixture-client';

describe('createStoryblokFixtureClient', () => {
	const client = createStoryblokFixtureClient();

	it('returns fixture stories for e2e-critical paths', async () => {
		const layout = await client.get('cdn/stories/globals/layout');
		const home = await client.get('cdn/stories/pages/home');
		const coreProgram = await client.get('cdn/stories/pages/programs/sierra-leone-core-program');
		const skillsProgram = await client.get('cdn/stories/pages/programs/skills-program');

		expect(layout.data.story.content.component).toBe('layout');
		expect(home.data.story.content.component).toBe('page');
		expect(home.data.story.content.content[0].component).toBe('heroVideo');
		expect(coreProgram.data.story.content.portalSlug).toBe('sierra-leone-core-program');
		expect(skillsProgram.data.story.content.portalSlug).toBe('skills-program');
	});

	it('throws for unknown story paths so service soft-fallbacks can catch', async () => {
		await expect(client.get('cdn/stories/pages/unknown')).rejects.toThrow(
			'Storyblok fixture not found for story path: pages/unknown',
		);
	});

	it('returns empty collections for list and getAll endpoints', async () => {
		const stories = await client.get('cdn/stories', { starts_with: 'pages/programs/' });
		const all = await client.getAll('cdn/stories', { starts_with: 'pages/campaigns/' });

		expect(stories.data.stories).toEqual([]);
		expect(stories.total).toBe(0);
		expect(all).toEqual([]);
	});
});
