import { type MultiSelectOption } from '@/components/multi-select';
import type { FocusStory } from '@/components/storyblok/focus/focus.types';
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

const getFocusTitleBySlug = (focuses: FocusStory[]) => {
	const focusTitleBySlug = new Map<string, string>();

	focuses.forEach((focus) => {
		const slug = focus.content.portalSlug?.trim();
		const title = focus.content.title?.trim();

		if (slug && title) {
			focusTitleBySlug.set(slug, title);
		}
	});

	return focusTitleBySlug;
};

export const ImpactMeasurementFilterSection = async ({ lang, searchParams }: ImpactMeasurementFilterSectionProps) => {
	const [translator, filterOptionsResult, storyblokFocusesResult] = await Promise.all([
		getImpactTranslator(lang),
		services.surveyImpact.getImpactFilterOptions(),
		services.storyblok.getFocuses(lang),
	]);
	const filterOptions = filterOptionsResult.success
		? filterOptionsResult.data
		: { countries: [], focuses: [], programs: [], questionnaires: [] };
	const storyblokFocuses = (storyblokFocusesResult.success ? storyblokFocusesResult.data : []) as FocusStory[];
	const focusTitleBySlug = getFocusTitleBySlug(storyblokFocuses);

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
			heading: translator.t('survey.impactMeasurement.filters.allFocuses'),
			options: filterOptions.focuses.map((option) => ({
				value: `${FILTER_PREFIX.focus}${option.value}`,
				label: focusTitleBySlug.get(option.label) ?? option.label,
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
