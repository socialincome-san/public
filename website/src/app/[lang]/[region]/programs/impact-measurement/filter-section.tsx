import type { FocusStory } from '@/components/storyblok/focus/focus.types';
import { SurveyQuestionnaire } from '@/generated/prisma/client';
import { isMessageKey } from '@/lib/i18n/message-keys';
import { getFocuses } from '@/modules/storyblok-content/storyblok-content.cache';
import { RECIPIENT_AGE_GROUPS } from '@/modules/surveys/survey-age-groups.types';
import { getSurveyImpactFilterOptions } from '@/modules/surveys/survey.cache';
import { type MultiSelectOption } from '@socialincome/design-system/forms/multi-select/multi-select';
import { getMessages, getTranslations } from 'next-intl/server';
import { questionnaireLabelKeys } from './config';
import { ImpactMeasurementFilters } from './filters';
import { FILTER_PREFIX, ImpactFilterQueryParams } from './filters.constants';
import { toSelectedFilterTokens } from './filters.server';

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
	const [t, tCountries, messages, filterOptionsResult, storyblokFocusesResult] = await Promise.all([
		getTranslations('website-survey'),
		getTranslations('countries'),
		getMessages(),
		getSurveyImpactFilterOptions(),
		getFocuses(lang),
	]);
	const filterOptions = filterOptionsResult.success
		? filterOptionsResult.data
		: { countries: [], focuses: [], programs: [], questionnaires: [] };
	const storyblokFocuses = (storyblokFocusesResult.success ? storyblokFocusesResult.data : []) as FocusStory[];
	const focusTitleBySlug = getFocusTitleBySlug(storyblokFocuses);

	const localizedQuestionnaireOptions = filterOptions.questionnaires.map((questionnaire) => ({
		value: questionnaire.value,
		label: t(
			questionnaireLabelKeys[questionnaire.value as SurveyQuestionnaire] ??
				'survey.impactMeasurement.questionnaires.fallback',
		),
	}));
	const localizedCountryOptions = filterOptions.countries.map((country) => ({
		value: country.value,
		label: isMessageKey(messages, 'countries', country.value) ? tCountries(country.value) : country.label,
	}));

	const recipientFilterGroups = [
		{
			heading: t('survey.impactMeasurement.recipientsFilter.genderHeading'),
			options: [
				{
					value: `${FILTER_PREFIX.recipient}male`,
					label: t('survey.impactMeasurement.recipientsFilter.gender.male'),
				},
				{
					value: `${FILTER_PREFIX.recipient}female`,
					label: t('survey.impactMeasurement.recipientsFilter.gender.female'),
				},
			],
		},
		{
			heading: t('survey.impactMeasurement.recipientsFilter.ageHeading'),
			options: RECIPIENT_AGE_GROUPS.map((ageGroup) => ({
				value: `${FILTER_PREFIX.recipient}${ageGroup}`,
				label: t(`survey.impactMeasurement.recipientsFilter.age.${ageGroup}`),
			})),
		},
	];

	const filterGroups: { heading: string; options: MultiSelectOption[] }[] = [
		{
			heading: t('survey.impactMeasurement.filters.allCountries'),
			options: localizedCountryOptions.map((option) => ({
				value: `${FILTER_PREFIX.country}${option.value}`,
				label: option.label,
			})),
		},
		{
			heading: t('survey.impactMeasurement.filters.allPrograms'),
			options: filterOptions.programs.map((option) => ({
				value: `${FILTER_PREFIX.program}${option.value}`,
				label: option.label,
			})),
		},
		{
			heading: t('survey.impactMeasurement.filters.allFocuses'),
			options: filterOptions.focuses.map((option) => ({
				value: `${FILTER_PREFIX.focus}${option.value}`,
				label: focusTitleBySlug.get(option.label) ?? option.label,
			})),
		},
		{
			heading: t('survey.impactMeasurement.filters.allSurveys'),
			options: localizedQuestionnaireOptions.map((option) => ({
				value: `${FILTER_PREFIX.questionnaire}${option.value}`,
				label: option.label,
			})),
		},
		...recipientFilterGroups,
	];

	return (
		<ImpactMeasurementFilters
			allFiltersPlaceholder={t('survey.impactMeasurement.filters.filter')}
			filterGroups={filterGroups}
			selectedFilters={toSelectedFilterTokens(searchParams)}
		/>
	);
};
