import type { PublicFocusStatsBySlugMap } from '@/lib/services/focus/focus.types';
import type { FocusStory } from './focus.types';
import {
	focusMatchesCountryQuery,
	focusMatchesSdgQuery,
	focusMatchesSearchQuery,
	getCountryFilterOptions,
	getCountryQuery,
	getSdgFilterOptions,
	getSdgQuery,
	getSearchQuery,
	sortFocusesByCandidatesCountDesc,
} from './focuses-overview.server';

type CreateFocusInput = {
	slug: string;
	portalSlug: string;
	title: string;
	text: string;
	sdgs?: (number | string)[];
};

const createFocus = ({ slug, portalSlug, title, text, sdgs }: CreateFocusInput) =>
	({
		uuid: slug,
		slug,
		full_slug: `pages/focuses/${slug}`,
		content: {
			component: 'focus',
			_uid: slug,
			portalSlug,
			title,
			text,
			sdgs,
		},
	}) as unknown as FocusStory;

const focuses = [
	createFocus({
		slug: 'health',
		portalSlug: 'health',
		title: 'Healthcare access',
		text: 'Cash transfers for medical support',
		sdgs: [3, '1', 'unknown'],
	}),
	createFocus({
		slug: 'education',
		portalSlug: 'education',
		title: 'Education',
		text: 'School access support',
		sdgs: ['4', 3],
	}),
];

const statsBySlug = {
	health: {
		programsCount: 2,
		recipientsInProgramsCount: 7,
		candidatesCount: 3,
		countryIsoCodes: ['KE', 'SL'],
	},
	education: {
		programsCount: 1,
		recipientsInProgramsCount: 5,
		candidatesCount: 1,
		countryIsoCodes: ['CH'],
	},
} as PublicFocusStatsBySlugMap;

describe('focuses overview server helpers', () => {
	it('reads search and country query params', () => {
		expect(getSearchQuery({ search: ' health ' })).toBe('health');
		expect(getCountryQuery({ country: ['KE', 'CH'] })).toBe('KE');
		expect(getSdgQuery({ sdg: ' 3 ' })).toBe('3');
	});

	it('derives country options from focus stats', () => {
		const countryOptions = getCountryFilterOptions(focuses, statsBySlug);

		expect(countryOptions.map((option) => option.value).sort()).toEqual(['CH', 'KE', 'SL']);
	});

	it('derives SDG options from assigned focus SDGs', () => {
		const sdgOptions = getSdgFilterOptions(focuses);

		expect(sdgOptions).toEqual([
			{ value: '1', label: 'SDG 1: No Poverty' },
			{ value: '3', label: 'SDG 3: Good Health and Well-being' },
			{ value: '4', label: 'SDG 4: Quality Education' },
		]);
	});

	it('filters focuses by assigned program country', () => {
		const kenyaFocuses = focuses.filter((focus) => focusMatchesCountryQuery(focus, statsBySlug, 'KE'));

		expect(kenyaFocuses.map((focus) => focus.content.portalSlug)).toEqual(['health']);
	});

	it('filters focuses by assigned SDG', () => {
		const healthFocuses = focuses.filter((focus) => focusMatchesSdgQuery(focus, '1'));
		const sharedSdgFocuses = focuses.filter((focus) => focusMatchesSdgQuery(focus, '3'));

		expect(healthFocuses.map((focus) => focus.content.portalSlug)).toEqual(['health']);
		expect(sharedSdgFocuses.map((focus) => focus.content.portalSlug)).toEqual(['health', 'education']);
	});

	it('searches focus title, slug, portal slug, and text', () => {
		const searchFilteredFocuses = focuses.filter((focus) => focusMatchesSearchQuery(focus, 'medical health'));

		expect(searchFilteredFocuses.map((focus) => focus.content.portalSlug)).toEqual(['health']);
	});

	it('sorts focuses by candidates count descending', () => {
		const missingStatsFocus = createFocus({
			slug: 'livelihood',
			portalSlug: 'livelihood',
			title: 'Livelihood',
			text: 'Cash transfers for livelihood support',
		});
		const sortedFocuses = sortFocusesByCandidatesCountDesc([...focuses, missingStatsFocus], statsBySlug);

		expect(sortedFocuses.map((focus) => focus.content.portalSlug)).toEqual(['health', 'education', 'livelihood']);
	});
});
