import type { PublicFocusStatsBySlugMap } from '@/lib/services/focus/focus.types';
import type { FocusStory } from './focus.types';
import {
	focusMatchesCountryQuery,
	focusMatchesSearchQuery,
	getCountryFilterOptions,
	getCountryQuery,
	getSearchQuery,
} from './focuses-overview.server';

const createFocus = ({ slug, portalSlug, title, text }: { slug: string; portalSlug: string; title: string; text: string }) =>
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
		},
	}) as unknown as FocusStory;

const focuses = [
	createFocus({
		slug: 'health',
		portalSlug: 'health',
		title: 'Healthcare access',
		text: 'Cash transfers for medical support',
	}),
	createFocus({
		slug: 'education',
		portalSlug: 'education',
		title: 'Education',
		text: 'School access support',
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
	});

	it('derives country options from focus stats', () => {
		const countryOptions = getCountryFilterOptions(focuses, statsBySlug);

		expect(countryOptions.map((option) => option.value).sort()).toEqual(['CH', 'KE', 'SL']);
	});

	it('filters focuses by assigned program country', () => {
		const kenyaFocuses = focuses.filter((focus) => focusMatchesCountryQuery(focus, statsBySlug, 'KE'));

		expect(kenyaFocuses.map((focus) => focus.content.portalSlug)).toEqual(['health']);
	});

	it('searches focus title, slug, portal slug, and text', () => {
		const searchFilteredFocuses = focuses.filter((focus) => focusMatchesSearchQuery(focus, 'medical health'));

		expect(searchFilteredFocuses.map((focus) => focus.content.portalSlug)).toEqual(['health']);
	});
});
