// Generic set of question pages and choices
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

export const livingLocationPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'livingLocationV1',
				isRequired: true,
				title: t('survey.questions.livingLocationTitleV1'),
				choices: livingLocationChoices(t),
			},
		],
	};
};

export const maritalStatusPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'maritalStatusV1',
				isRequired: true,
				title: t('survey.questions.maritalStatusTitleV1'),
				choices: maritalStatusChoices(t),
			},
		],
	};
};

export const dependentsPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'hasDependentsV1',
				isRequired: true,
				title: t('survey.questions.hasDependentsTitleV1'),
				description: t('survey.questions.hasDependentsDescV1'),
				choices: yesNoChoices(t),
			},
			{
				type: 'radiogroup',
				name: 'nrDependentsV1',
				isRequired: true,
				title: t('survey.questions.nrDependentsTitleV1'),
				visibleIf: '{hasDependentsV1}=true',
				choices: nrDependentsChoices(t),
			},
		],
	};
};

export const schoolAttendancePage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'schoolAttendanceV1',
				isRequired: true,
				title: t('survey.questions.attendingSchoolV1'),
				choices: yesNoChoices(t),
			},
		],
	};
};

export const employmentStatusPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'employmentStatusV1',
				isRequired: true,
				title: t('survey.questions.employmentStatusTitleV1'),
				choices: employmentStatusChoices(t),
			},
			{
				type: 'radiogroup',
				name: 'notEmployedV1',
				visibleIf: '{employmentStatusV1}=notEmployed',
				title: t('survey.questions.notEmployedTitleV1'),
				isRequired: true,
				choices: yesNoChoices(t),
			},
		],
	};
};

export const disabilityPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'disabilityV1',
				isRequired: true,
				title: t('survey.questions.disabilityTitleV1'),
				choices: yesNoChoices(t),
			},
		],
	};
};

export const skippingMealsPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'skippingMealsV1',
				isRequired: true,
				title: t('survey.questions.skippingMealsTitleV1'),
				choices: yesNoChoices(t),
			},
			{
				type: 'radiogroup',
				name: 'skippingMealsLastWeekV1',
				visibleIf: '{skippingMealsV1}=true',
				title: t('survey.questions.skippingMealsLastWeekTitleV1'),
				isRequired: true,
				choices: yesNoChoices(t),
			},
			{
				type: 'radiogroup',
				name: 'skippingMealsLastWeek3MealsV1',
				visibleIf: '{skippingMealsLastWeekV1}=true',
				title: t('survey.questions.skippingMealsLastWeek3MealsTitleV1'),
				isRequired: true,
				choices: yesNoChoices(t),
			},
		],
	};
};

export const unexpectedExpensesCoveredPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'unexpectedExpensesCoveredV1',
				isRequired: true,
				title: t('survey.questions.unexpectedExpensesCoveredTitleV1'),
				choices: yesNoChoices(t),
			},
		],
	};
};

export const savingsPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'savingsV1',
				isRequired: true,
				title: t('survey.questions.savingsTitleV1'),
				choices: yesNoChoices(t),
			},
		],
	};
};

export const debtPersonalPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'debtPersonalV1',
				isRequired: true,
				title: t('survey.questions.debtPersonalTitleV1'),
				choices: yesNoChoices(t),
			},
			{
				type: 'radiogroup',
				name: 'debtPersonalRepayV1',
				visibleIf: '{debtPersonalV1}=true',
				title: t('survey.questions.debtPersonalRepayTitleV1'),
				isRequired: true,
				choices: yesNoChoices(t),
			},
		],
	};
};

export const debtHouseholdPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'debtHouseholdV1',
				isRequired: true,
				title: t('survey.questions.debtHouseholdTitleV1'),
				choices: yesNoChoices(t),
			},
			{
				type: 'radiogroup',
				name: 'debtHouseholdWhoRepaysV1',
				visibleIf: '{debtHouseholdV1}=true',
				title: t('survey.questions.debtHouseholdWhoRepaysTitleV1'),
				isRequired: true,
				choices: yesNoChoices(t),
			},
		],
	};
};

export const otherSupportPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'otherSupportV1',
				isRequired: true,
				title: t('survey.questions.otherSupportTitleV1'),
				choices: yesNoChoices(t),
			},
		],
	};
};

export const plannedAchievementsPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'comment',
				name: 'plannedAchievementV1',
				isRequired: true,
				title: t('survey.questions.plannedAchievementTitleV1'),
			},
		],
	};
};

// Additional questions for check-in survey for active recipients

export const spendingPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'checkbox',
				name: 'spendingV1',
				isRequired: true,
				title: t('survey.questions.spendingTitleV1'),
				choices: spendingChoices(t),
			},
			{
				type: 'ranking',
				name: 'spendingRankedV1',
				title: t('survey.questions.spendingRankingTitleV1'),
				description: t('survey.questions.spendingRankingDescV1'),
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
				type: 'comment',
				name: 'plannedAchievementRemainingV1',
				isRequired: true,
				title: t('survey.questions.plannedAchievementRemainingTitleV1'),
			},
		],
	};
};

// Additional questions for offboarding survey

export const impactFinancialPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'impactFinancialIndependenceV1',
				isRequired: true,
				title: t('survey.questions.financialIndependenceTitleV1'),
				choices: yesNoChoices(t),
			},
		],
	};
};

export const impactLifePage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'comment',
				name: 'impactLifeGeneralV1',
				isRequired: true,
				title: t('survey.questions.impactLifeGeneralTitleV1'),
			},
		],
	};
};

export const achievementsAchievedPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'achievementsAchievedV1',
				isRequired: true,
				title: t('survey.questions.achievementsAchievedTitleV1'),
				choices: yesNoChoices(t),
			},
			{
				type: 'comment',
				name: 'achievementsNotAchievedCommentV1',
				visibleIf: '{achievementsAchievedV1}=false',
				title: t('survey.questions.achievementsNotAchievedCommentTitleV1'),
				isRequired: true,
			},
		],
	};
};

export const happierPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'happierV1',
				isRequired: true,
				title: t('survey.questions.happierTitleV1'),
				choices: yesNoChoices(t),
			},
			{
				type: 'comment',
				name: 'happierCommentV1',
				visibleIf: '{happier}=true',
				title: t('survey.questions.happierCommentTitleV1'),
				isRequired: true,
			},
			{
				type: 'comment',
				name: 'notHappierCommentV1',
				visibleIf: '{happierCommentV1}=false',
				title: t('survey.questions.notHappierCommentTitleV1'),
				isRequired: true,
			},
		],
	};
};

export const longEnoughPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'longEnough',
				isRequired: true,
				title: t('survey.questions.longEnoughTitleV1'),
				choices: yesNoChoices(t),
			},
		],
	};
};

// Additional questions for check-in survey for former recipients

// Reusable choices

export const yesNoChoices = (t: TranslateFunction) =>
	[
		[true, 'yes'],
		[false, 'no'],
	].map(([value, translationKey]) => {
		return {
			value: value,
			text: t('survey.questions.yesNoChoices.' + translationKey),
		};
	});

export const maritalStatusChoices = (t: TranslateFunction) =>
	['married', 'widowed', 'divorced', 'separated', 'neverMarried'].map((key) => {
		return {
			value: key,
			text: t('survey.questions.maritalStatusChoices.' + key),
		};
	});

export const nrDependentsChoices = (t: TranslateFunction) =>
	['1-2', '3-4', '5-7', '8-10', '10-'].map((key) => {
		return {
			value: key,
			text: t('survey.questions.nrDependentsChoices.' + key),
		};
	});
export const employmentStatusChoices = (t: TranslateFunction) =>
	['employed', 'selfEmployed', 'notEmployed', 'retired'].map((key) => {
		return {
			value: key,
			text: t('survey.questions.employmentStatusChoices.' + key),
		};
	});

export const livingLocationChoices = (t: TranslateFunction) =>
	[
		'westernAreaUrbanFreetown',
		'westernAreaRural',
		'easternProvince',
		'northernProvince',
		'southernProvince',
		'northWestProvince',
	].map((key) => {
		return {
			value: key,
			text: t('survey.questions.livingLocationChoices.' + key),
		};
	});

export const spendingChoices = (t: TranslateFunction) =>
	['education', 'food', 'housing', 'healthCare', 'mobility', 'saving', 'investment'].map((key) => {
		return {
			value: key,
			text: t('survey.questions.spendingChoices.' + key),
		};
	});
