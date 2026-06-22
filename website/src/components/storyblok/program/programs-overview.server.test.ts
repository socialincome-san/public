import type { PublicProgramFilterDataMap } from '@/lib/services/program/program.types';
import type { ProgramStory } from './program.types';
import {
	getCountryFilterOptions,
	getFilterDataForPrograms,
	getFocusIdBySlug,
	getFocusQuery,
	programMatchesFocusQuery,
	programMatchesSearchQuery,
} from './programs-overview.server';

const createProgram = ({ portalSlug, title, description }: { portalSlug: string; title: string; description: string }) =>
	({
		uuid: portalSlug,
		slug: portalSlug,
		content: {
			portalSlug,
			title,
			description,
			primaryImage: {},
			secondaryImage: {},
			tertiaryImage: {},
			component: 'program',
			_uid: portalSlug,
		},
	}) as ProgramStory;

const programs = [
	createProgram({
		portalSlug: 'kenya-health',
		title: 'Kenya Health Program',
		description: 'Cash transfers for healthcare access',
	}),
	createProgram({
		portalSlug: 'sierra-leone-health',
		title: 'Sierra Leone Health Program',
		description: 'Community health support',
	}),
	createProgram({
		portalSlug: 'switzerland-education',
		title: 'Switzerland Education Program',
		description: 'Education support',
	}),
];

const filterDataByPortalSlug = {
	'kenya-health': {
		programId: 'program-kenya-health',
		countryIsoCode: 'KE',
		focuses: [{ id: 'focus-health', slug: 'health' }],
	},
	'sierra-leone-health': {
		programId: 'program-sierra-leone-health',
		countryIsoCode: 'SL',
		focuses: [{ id: 'focus-health', slug: 'health' }],
	},
	'switzerland-education': {
		programId: 'program-switzerland-education',
		countryIsoCode: 'CH',
		focuses: [{ id: 'focus-education', slug: 'education' }],
	},
} as PublicProgramFilterDataMap;

describe('programs overview server helpers', () => {
	it('uses a fixed focus id instead of a mismatched focus query', () => {
		const fixedFocusId = getFocusIdBySlug(filterDataByPortalSlug, 'health');
		const focusQuery = getFocusQuery({ focus: 'focus-education' });
		const focusScopedPrograms = programs.filter((program) =>
			programMatchesFocusQuery(program, filterDataByPortalSlug, fixedFocusId),
		);

		expect(focusQuery).toBe('focus-education');
		expect(focusScopedPrograms.map((program) => program.content.portalSlug)).toEqual([
			'kenya-health',
			'sierra-leone-health',
		]);
	});

	it('derives country options from focus-scoped programs only', () => {
		const fixedFocusId = getFocusIdBySlug(filterDataByPortalSlug, 'health');
		const focusScopedPrograms = programs.filter((program) =>
			programMatchesFocusQuery(program, filterDataByPortalSlug, fixedFocusId),
		);
		const focusScopedFilterData = getFilterDataForPrograms(focusScopedPrograms, filterDataByPortalSlug);
		const countryOptions = getCountryFilterOptions(focusScopedFilterData);

		expect(countryOptions.map((option) => option.value).sort()).toEqual(['KE', 'SL']);
	});

	it('searches within a focus-scoped program list', () => {
		const fixedFocusId = getFocusIdBySlug(filterDataByPortalSlug, 'health');
		const focusScopedPrograms = programs.filter((program) =>
			programMatchesFocusQuery(program, filterDataByPortalSlug, fixedFocusId),
		);
		const searchFilteredPrograms = focusScopedPrograms.filter((program) => programMatchesSearchQuery(program, 'cash kenya'));

		expect(searchFilteredPrograms.map((program) => program.content.portalSlug)).toEqual(['kenya-health']);
	});
});
