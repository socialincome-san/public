import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { selectLocalPartnerProgramStories } from './local-partner-programs.utils';

const story = (portalSlug: string) => ({ content: { portalSlug, title: portalSlug } }) as unknown as ProgramStory;

const stories = [story('alpha'), story('beta'), story('gamma')];
const filterData = {
	alpha: { programId: 'p-alpha', countryIsoCode: 'SL' },
	beta: { programId: 'p-beta', countryIsoCode: 'SL' },
	gamma: { programId: 'p-gamma', countryIsoCode: 'GH' },
};

describe('selectLocalPartnerProgramStories', () => {
	it('returns the programs the partner has recipients in', () => {
		const selection = selectLocalPartnerProgramStories(stories, filterData, { 'p-beta': 4 }, 'SL');

		expect(selection.isPartnerScoped).toBe(true);
		expect(selection.stories).toEqual([stories[1]]);
	});

	it('stays partner scoped even when a linked program has no story yet', () => {
		const selection = selectLocalPartnerProgramStories(stories, filterData, { 'p-unpublished': 7 }, 'SL');

		expect(selection.isPartnerScoped).toBe(true);
		expect(selection.stories).toEqual([]);
	});

	it('keeps a linked program with zero recipients instead of falling back to the country list', () => {
		const selection = selectLocalPartnerProgramStories(stories, filterData, { 'p-beta': 0 }, 'SL');

		expect(selection.isPartnerScoped).toBe(true);
		expect(selection.stories).toEqual([stories[1]]);
	});

	it('falls back to the programs of the partner country when no recipients are linked', () => {
		const selection = selectLocalPartnerProgramStories(stories, filterData, {}, 'sl');

		expect(selection.isPartnerScoped).toBe(false);
		expect(selection.stories).toEqual([stories[0], stories[1]]);
	});

	it('returns nothing when there are no recipients and no country', () => {
		expect(selectLocalPartnerProgramStories(stories, filterData, {}, '  ')).toEqual({
			stories: [],
			isPartnerScoped: false,
		});
	});
});
