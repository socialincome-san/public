import type { ProgramStory } from '@/components/storyblok/program/program.types';
import type { PublicProgramFilterDataMap, PublicProgramStats } from '@/modules/programs/program.types';
import { limitGridPrograms, programMatchesGridFilter, sortGridPrograms } from './program-grid.utils';

const createProgram = (portalSlug: string, title: string, firstPublishedAt: string) =>
	({
		uuid: portalSlug,
		slug: portalSlug,
		created_at: '2020-01-01T00:00:00.000Z',
		first_published_at: firstPublishedAt,
		content: { portalSlug, title, component: 'program', _uid: portalSlug },
	}) as ProgramStory;

const kenya = createProgram('kenya-health', 'Kenya Health', '2024-05-01T00:00:00.000Z');
const sierraLeone = createProgram('sl-education', 'Sierra Leone Education', '2025-02-01T00:00:00.000Z');
const ethiopia = createProgram('et-health', 'Ethiopia Health', '2023-01-01T00:00:00.000Z');
const programs = [kenya, sierraLeone, ethiopia];

const filterData: PublicProgramFilterDataMap = {
	'kenya-health': {
		programId: '1',
		countryIsoCode: 'KE',
		focuses: [{ id: 'f1', slug: 'health' }],
		localPartnerSlugs: ['partner-a'],
	},
	'sl-education': {
		programId: '2',
		countryIsoCode: 'SL',
		focuses: [{ id: 'f2', slug: 'education' }],
		localPartnerSlugs: ['partner-a', 'partner-b'],
	},
	'et-health': { programId: '3', countryIsoCode: 'ET', focuses: [{ id: 'f1', slug: 'health' }], localPartnerSlugs: [] },
};

const createStats = (recipientsCount: number) => ({ recipientsCount }) as PublicProgramStats;

describe('programMatchesGridFilter', () => {
	const matching = (filter: Parameters<typeof programMatchesGridFilter>[1]) =>
		programs.filter((program) => programMatchesGridFilter(program, filter, filterData)).map(({ slug }) => slug);

	it('matches the country case-insensitively', () => {
		expect(matching({ by: 'country', value: 'sl' })).toEqual(['sl-education']);
	});

	it('matches any of the program focuses', () => {
		expect(matching({ by: 'focus', value: 'health' })).toEqual(['kenya-health', 'et-health']);
	});

	it('matches local partners that have recipients in the program', () => {
		expect(matching({ by: 'localPartner', value: 'partner-a' })).toEqual(['kenya-health', 'sl-education']);
	});

	it('excludes programs without portal data', () => {
		expect(programMatchesGridFilter(kenya, { by: 'country', value: 'KE' }, {})).toBe(false);
	});
});

describe('sortGridPrograms', () => {
	const sortedSlugs = (sortBy: Parameters<typeof sortGridPrograms>[1]) =>
		sortGridPrograms(
			programs,
			sortBy,
			{ 'kenya-health': createStats(40), 'sl-education': createStats(10), 'et-health': createStats(90) },
			'en',
		).map(({ slug }) => slug);

	it('keeps the given order without a sort option', () => {
		expect(sortedSlugs('')).toEqual(['kenya-health', 'sl-education', 'et-health']);
	});

	it('sorts newest first by first publication', () => {
		expect(sortedSlugs('newest')).toEqual(['sl-education', 'kenya-health', 'et-health']);
	});

	it('sorts by recipients, largest first', () => {
		expect(sortedSlugs('recipients')).toEqual(['et-health', 'kenya-health', 'sl-education']);
	});

	it('sorts alphabetically by title', () => {
		expect(sortedSlugs('alphabetical')).toEqual(['et-health', 'kenya-health', 'sl-education']);
	});
});

describe('limitGridPrograms', () => {
	it('shows all programs without a maximum', () => {
		expect(limitGridPrograms(programs, '')).toHaveLength(3);
	});

	it('cuts the list at the maximum', () => {
		expect(limitGridPrograms(programs, '3').slice(0, 2)).toEqual([kenya, sierraLeone]);
		expect(limitGridPrograms([...programs, ...programs], '3')).toHaveLength(3);
	});

	it('shows fewer programs when fewer exist', () => {
		expect(limitGridPrograms(programs.slice(0, 2), '6')).toHaveLength(2);
	});
});
