import type { ProgramStory } from '@/lib/storyblok/program-story';
import { selectLocalPartnerProgramStories } from './local-partner-programs.utils';

const story = (portalSlug: string) => ({ content: { portalSlug, title: portalSlug } }) as unknown as ProgramStory;

const stories = [story('alpha'), story('beta'), story('gamma')];
const filterData = {
	alpha: { programId: 'p-alpha' },
	beta: { programId: 'p-beta' },
	gamma: { programId: 'p-gamma' },
};

describe('selectLocalPartnerProgramStories', () => {
	it('returns the programs the partner has recipients in', () => {
		const selection = selectLocalPartnerProgramStories(stories, filterData, { 'p-beta': 4 });

		expect(selection.isPartnerScoped).toBe(true);
		expect(selection.stories).toEqual([stories[1]]);
	});

	it('stays partner scoped even when a linked program has no story yet', () => {
		const selection = selectLocalPartnerProgramStories(stories, filterData, { 'p-unpublished': 7 });

		expect(selection.isPartnerScoped).toBe(true);
		expect(selection.stories).toEqual([]);
	});

	it('keeps a linked program with zero recipients', () => {
		const selection = selectLocalPartnerProgramStories(stories, filterData, { 'p-beta': 0 });

		expect(selection.isPartnerScoped).toBe(true);
		expect(selection.stories).toEqual([stories[1]]);
	});

	it('returns nothing when the partner has no recipients', () => {
		expect(selectLocalPartnerProgramStories(stories, filterData, {})).toEqual({
			stories: [],
			isPartnerScoped: false,
		});
	});
});
