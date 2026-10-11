import { Gender, SurveyQuestionnaire } from '@/generated/prisma/client';
import { toImpactServiceFilters, toSelectedFilterTokens } from './filters.server';

jest.mock('@/generated/prisma/client', () => ({
	CountryCode: { KE: 'KE' },
	Gender: { female: 'female', male: 'male' },
	SurveyQuestionnaire: { onboarding: 'onboarding' },
}));

describe('impact measurement filter parsing', () => {
	test('maps focus query params to service filters and selected tokens', () => {
		const searchParams = {
			focus: 'focus-health, focus-education',
			program: 'program-alpha',
			questionnaire: SurveyQuestionnaire.onboarding,
			recipientFilters: `${Gender.male},youth,not-a-recipient-filter`,
		};

		expect(toImpactServiceFilters(searchParams)).toEqual({
			focusIds: ['focus-health', 'focus-education'],
			programIds: ['program-alpha'],
			questionnaires: [SurveyQuestionnaire.onboarding],
			recipientGenders: [Gender.male],
			recipientAgeGroups: ['youth'],
		});
		expect(toSelectedFilterTokens(searchParams)).toEqual([
			'focus:focus-health',
			'focus:focus-education',
			'program:program-alpha',
			`questionnaire:${SurveyQuestionnaire.onboarding}`,
			`recipient:${Gender.male}`,
			'recipient:youth',
			'recipient:not-a-recipient-filter',
		]);
	});
});

jest.mock('@/generated/prisma/client', () => ({
	CountryCode: { SL: 'SL' },
	Gender: { female: 'female', male: 'male' },
	SurveyQuestionnaire: { onboarding: 'onboarding' },
}));

describe('impact measurement filter helpers', () => {
	it('maps focus query params to service filters', () => {
		expect(
			toImpactServiceFilters({
				country: 'SL,invalid',
				program: 'program-1',
				focus: 'focus-health,focus-poverty',
				questionnaire: 'onboarding,invalid',
				recipientFilters: 'female,youngAdults,unknown',
			}),
		).toEqual({
			countryIsoCodes: ['SL'],
			programIds: ['program-1'],
			focusIds: ['focus-health', 'focus-poverty'],
			questionnaires: ['onboarding'],
			recipientGenders: ['female'],
			recipientAgeGroups: ['youngAdults'],
		});
	});

	it('round-trips focus query params as selected filter tokens', () => {
		expect(
			toSelectedFilterTokens({
				focus: 'focus-health,focus-poverty',
			}),
		).toEqual(['focus:focus-health', 'focus:focus-poverty']);
	});
});
