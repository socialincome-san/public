// Generic set of question pages and choices
import {
	ACHIEVEMENTS_ACHIEVED,
	ACHIEVEMENTS_NOT_ACHIEVED,
	DEBT_HOUSEHOLD,
	DEBT_HOUSEHOLD_WHO_REPAYS,
	DEBT_PERSONAL,
	DEBT_PERSONAL_REPAY,
	DISABILITY,
	EMPLOYMENT_STATUS,
	HAPPIER,
	HAPPIER_COMMENT,
	HAS_DEPENDENTS,
	IMPACT_FINANCIAL_INDEPENDENCE,
	IMPACT_LIFE_GENERAL,
	LIVING_LOCATION,
	LONG_ENOUGH,
	MARITAL_STATUS,
	NOT_EMPLOYED,
	NOT_HAPPIER_COMMENT,
	NUMBER_OF_DEPENDENTS,
	OTHER_SUPPORT,
	PLANNED_ACHIEVEMENT,
	PLANNED_ACHIEVEMENT_REMAINING,
	Question,
	RANKING,
	SAVINGS,
	SCHOOL_ATTENDANCE,
	SKIPPING_MEALS,
	SKIPPING_MEALS_LAST_WEEK,
	SKIPPING_MEALS_LAST_WEEK_3_MEALS,
	SPENDING,
	UNEXPECTED_EXPENSES_COVERED,
} from '@/lib/types/question';
import { TranslateFunction } from '@socialincome/shared/src/utils/i18n';

// Final question pages
export const welcomePage = (t: TranslateFunction, name: string) => {
	return {
		name: 'Welcome',
		elements: [
			{
				type: 'panel',
				name: 'welcome',
				elements: [
					{
						type: 'html',
						name: 'welcome-text',
						html: `<br/>${t('survey.common.welcome')}`,
					},
				],
				title: `${t('survey.common.hello')} ${name}`,
			},
		],
	};
};

// Questions for onboarding survey (reused in other surveys)

function getSimpleMapping(question: Question, t: TranslateFunction): Object {
	return {
		type: question.type,
		name: question.name,
		title: t(question.translationKey),
		description: question.descriptionTranslationKey && t(question.descriptionTranslationKey),
		choices:
			question.choices && question.choices.length
				? translateChoices(t, question.choices, question.choicesTranslationKey!)
				: undefined,
	};
}

export const livingLocationPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(LIVING_LOCATION, t),
				isRequired: true,
			},
		],
	};
};

export const maritalStatusPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(MARITAL_STATUS, t),
				isRequired: true,
			},
		],
	};
};

export const dependentsPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(HAS_DEPENDENTS, t),
				isRequired: true,
			},
			{
				...getSimpleMapping(NUMBER_OF_DEPENDENTS, t),
				isRequired: true,
				visibleIf: '{hasDependentsV1}=true',
			},
		],
	};
};

export const schoolAttendancePage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(SCHOOL_ATTENDANCE, t),
				isRequired: true,
			},
		],
	};
};

export const employmentStatusPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(EMPLOYMENT_STATUS, t),
				isRequired: true,
			},
			{
				...getSimpleMapping(NOT_EMPLOYED, t),
				visibleIf: '{employmentStatusV1}=notEmployed',
				isRequired: true,
			},
		],
	};
};

export const disabilityPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(DISABILITY, t),
				isRequired: true,
			},
		],
	};
};

export const skippingMealsPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(SKIPPING_MEALS, t),
				isRequired: true,
			},
			{
				...getSimpleMapping(SKIPPING_MEALS_LAST_WEEK, t),
				visibleIf: '{skippingMealsV1}=true',
				isRequired: true,
			},
			{
				...getSimpleMapping(SKIPPING_MEALS_LAST_WEEK_3_MEALS, t),
				visibleIf: '{skippingMealsLastWeekV1}=true',
				isRequired: true,
			},
		],
	};
};

export const unexpectedExpensesCoveredPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(UNEXPECTED_EXPENSES_COVERED, t),
				isRequired: true,
			},
		],
	};
};

export const savingsPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(SAVINGS, t),
				isRequired: true,
			},
		],
	};
};

export const debtPersonalPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(DEBT_PERSONAL, t),
				isRequired: true,
			},
			{
				...getSimpleMapping(DEBT_PERSONAL_REPAY, t),
				visibleIf: '{debtPersonalV1}=true',
				isRequired: true,
			},
		],
	};
};

export const debtHouseholdPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(DEBT_HOUSEHOLD, t),
				isRequired: true,
			},
			{
				...getSimpleMapping(DEBT_HOUSEHOLD_WHO_REPAYS, t),
				visibleIf: '{debtHouseholdV1}=true',
				isRequired: true,
			},
		],
	};
};

export const otherSupportPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(OTHER_SUPPORT, t),
				isRequired: true,
			},
		],
	};
};

export const plannedAchievementsPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(PLANNED_ACHIEVEMENT, t),
				isRequired: true,
			},
		],
	};
};

// Additional questions for check-in survey for active recipients

export const spendingPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(SPENDING, t),
				isRequired: true,
			},
			{
				...getSimpleMapping(RANKING, t),
				visibleIf: '{spendingV1.length} > 1',
				isRequired: true,
				choicesFromQuestion: 'spendingV1',
				choicesFromQuestionMode: 'selected',
			},
		],
	};
};

export const plannedAchievementsRemainingPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(PLANNED_ACHIEVEMENT_REMAINING, t),
				isRequired: true,
			},
		],
	};
};

// Additional questions for offboarding survey

export const impactFinancialPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(IMPACT_FINANCIAL_INDEPENDENCE, t),
				isRequired: true,
			},
		],
	};
};

export const impactLifePage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(IMPACT_LIFE_GENERAL, t),
				isRequired: true,
			},
		],
	};
};

export const achievementsAchievedPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(ACHIEVEMENTS_ACHIEVED, t),
				isRequired: true,
			},
			{
				...getSimpleMapping(ACHIEVEMENTS_NOT_ACHIEVED, t),

				visibleIf: '{achievementsAchievedV1}=false',
				isRequired: true,
			},
		],
	};
};

export const happierPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(HAPPIER, t),
				isRequired: true,
			},
			{
				...getSimpleMapping(HAPPIER_COMMENT, t),
				visibleIf: '{happier}=true',
				isRequired: true,
			},
			{
				...getSimpleMapping(NOT_HAPPIER_COMMENT, t),
				visibleIf: '{happierCommentV1}=false',
				isRequired: true,
			},
		],
	};
};

export const longEnoughPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(LONG_ENOUGH, t),
				isRequired: true,
			},
		],
	};
};

const translateChoices = (t: TranslateFunction, choices: any[], choicesTranslationKey: String) =>
	choices.map((key) => {
		return {
			value: key,
			text: t(choicesTranslationKey + '.' + key),
		};
	});
