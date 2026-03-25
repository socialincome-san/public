import { type MultiSelectOption } from '@/components/multi-select';
import { SurveyQuestionnaire } from '@/generated/prisma/client';
import { RECIPIENT_AGE_GROUPS } from '@/lib/constants/recipient-age-groups';
import { services } from '@/lib/services/services';
import { questionnaireLabelKeys } from './config';
import { ImpactMeasurementFilters } from './filters';
import { FILTER_PREFIX, ImpactFilterQueryParams } from './filters.constants';
import { toSelectedFilterTokens } from './filters.server';
import { getImpactTranslator } from './translator';

type ImpactMeasurementFilterSectionProps = {
	lang: string;
	searchParams: ImpactFilterQueryParams;
};

export const ImpactMeasurementFilterSection = async ({ lang, searchParams }: ImpactMeasurementFilterSectionProps) => {
	const translator = await getImpactTranslator(lang);
	const filterOptionsResult = await services.surveyImpact.getImpactFilterOptions();
	const filterOptions = filterOptionsResult.success
		? filterOptionsResult.data
		: { countries: [], programs: [], questionnaires: [] };

	const localizedQuestionnaireOptions = filterOptions.questionnaires.map((questionnaire) => ({
		value: questionnaire.value,
		label: translator.t(
			questionnaireLabelKeys[questionnaire.value as SurveyQuestionnaire] ??
				'survey.impactMeasurement.questionnaires.fallback',
		),
	}));
	const localizedCountryOptions = filterOptions.countries.map((country) => {
		const translatedCountry = translator.t(country.value);

		return {
			value: country.value,
			label: translatedCountry === country.value ? country.label : translatedCountry,
		};
	});

	const recipientFilterGroups = [
		{
			heading: translator.t('survey.impactMeasurement.recipientsFilter.genderHeading'),
			options: [
				{
					value: `${FILTER_PREFIX.recipient}male`,
					label: translator.t('survey.impactMeasurement.recipientsFilter.gender.male'),
				},
				{
					value: `${FILTER_PREFIX.recipient}female`,
					label: translator.t('survey.impactMeasurement.recipientsFilter.gender.female'),
				},
			],
		},
		{
			heading: translator.t('survey.impactMeasurement.recipientsFilter.ageHeading'),
			options: RECIPIENT_AGE_GROUPS.map((ageGroup) => ({
				value: `${FILTER_PREFIX.recipient}${ageGroup}`,
				label: translator.t(`survey.impactMeasurement.recipientsFilter.age.${ageGroup}`),
			})),
		},
	];

	const filterGroups: { heading: string; options: MultiSelectOption[] }[] = [
		{
			heading: translator.t('survey.impactMeasurement.filters.allCountries'),
			options: localizedCountryOptions.map((option) => ({
				value: `${FILTER_PREFIX.country}${option.value}`,
				label: option.label,
			})),
		},
		{
			heading: translator.t('survey.impactMeasurement.filters.allPrograms'),
			options: filterOptions.programs.map((option) => ({
				value: `${FILTER_PREFIX.program}${option.value}`,
				label: option.label,
			})),
		},
		{
			heading: translator.t('survey.impactMeasurement.filters.allSurveys'),
			options: localizedQuestionnaireOptions.map((option) => ({
				value: `${FILTER_PREFIX.questionnaire}${option.value}`,
				label: option.label,
			})),
		},
		...recipientFilterGroups,
	];

	return (
		<ImpactMeasurementFilters
			allFiltersPlaceholder={translator.t('survey.impactMeasurement.filters.filter')}
			filterGroups={filterGroups}
			selectedFilters={toSelectedFilterTokens(searchParams)}
		/>
	);
};
