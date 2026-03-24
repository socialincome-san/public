import { CountryCode, Gender, SurveyQuestionnaire } from '@/generated/prisma/client';
import { RECIPIENT_AGE_GROUPS, RecipientAgeGroup } from '@/lib/constants/recipient-age-groups';
import { FILTER_PREFIX, ImpactFilterQueryParams, parseCsvParam } from './filters.constants';

const isEnumValue = <T extends Record<string, string>>(enumObj: T, value: string): value is T[keyof T] =>
	Object.values(enumObj).includes(value);

const toTypedImpactFilters = (searchParams: ImpactFilterQueryParams) => {
	const selectedCountries = parseCsvParam(searchParams.country).filter((value): value is CountryCode =>
		isEnumValue(CountryCode, value),
	);
	const selectedPrograms = parseCsvParam(searchParams.program);
	const selectedQuestionnaires = parseCsvParam(searchParams.questionnaire).filter((value): value is SurveyQuestionnaire =>
		isEnumValue(SurveyQuestionnaire, value),
	);
	const selectedRecipientFilters = parseCsvParam(searchParams.recipientFilters);
	const selectedRecipientGenders = selectedRecipientFilters.filter(
		(value): value is Gender => value === Gender.male || value === Gender.female,
	);
	const selectedRecipientAgeGroups = selectedRecipientFilters.filter((value): value is RecipientAgeGroup =>
		RECIPIENT_AGE_GROUPS.includes(value as RecipientAgeGroup),
	);

	return {
		selectedCountries,
		selectedPrograms,
		selectedQuestionnaires,
		selectedRecipientFilters,
		selectedRecipientGenders,
		selectedRecipientAgeGroups,
	};
};

export const toImpactServiceFilters = (searchParams: ImpactFilterQueryParams) => {
	const {
		selectedCountries,
		selectedPrograms,
		selectedQuestionnaires,
		selectedRecipientGenders,
		selectedRecipientAgeGroups,
	} = toTypedImpactFilters(searchParams);

	return {
		...(selectedCountries.length > 0 ? { countryIsoCodes: selectedCountries } : {}),
		...(selectedPrograms.length > 0 ? { programIds: selectedPrograms } : {}),
		...(selectedQuestionnaires.length > 0 ? { questionnaires: selectedQuestionnaires } : {}),
		...(selectedRecipientGenders.length > 0 ? { recipientGenders: selectedRecipientGenders } : {}),
		...(selectedRecipientAgeGroups.length > 0 ? { recipientAgeGroups: selectedRecipientAgeGroups } : {}),
	};
};

export const toSelectedFilterTokens = (searchParams: ImpactFilterQueryParams): string[] => {
	const { selectedCountries, selectedPrograms, selectedQuestionnaires, selectedRecipientFilters } =
		toTypedImpactFilters(searchParams);

	return [
		...selectedCountries.map((country) => `${FILTER_PREFIX.country}${country}`),
		...selectedPrograms.map((program) => `${FILTER_PREFIX.program}${program}`),
		...selectedQuestionnaires.map((questionnaire) => `${FILTER_PREFIX.questionnaire}${questionnaire}`),
		...selectedRecipientFilters.map((value) => `${FILTER_PREFIX.recipient}${value}`),
	];
};
