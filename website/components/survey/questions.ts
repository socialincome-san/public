// Generic set of question pages and choices
import { TFunction } from 'i18next';

// Final question pages
export const welcomePage = (t: TFunction, name: string) => {
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

export const livingLocationPage = (t: TFunction) => {
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

export const maritalStatusPage = (t: TFunction) => {
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

export const dependentsPage = (t: TFunction) => {
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

export const schoolPageXXX = (t: TFunction) => {
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

export const employmentStatusPage = (t: TFunction) => {
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

export const disabilityPage = (t: TFunction) => {
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

export const skippingMealsPage = (t: TFunction) => {
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

export const unexpectedExpensesCoveredPage = (t: TFunction) => {
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

export const savingsPage = (t: TFunction) => {
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

export const debtPersonalPage = (t: TFunction) => {
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

export const debtHouseholdPage = (t: TFunction) => {
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

export const otherSupportPage = (t: TFunction) => {
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

export const plannedAchievementsPage = (t: TFunction, isOnboarding: boolean) => {
	return {
		elements: [
			{
				type: 'comment',
				name: 'plannedAchievement',
				isRequired: true,
				// xxx: why title isOnboarding?
				title: isOnboarding
					? t('survey.questions.plannedAchievementOnboardingTitleV1')
					: t('survey.questions.plannedAchievementCheckingTitleV1'),
				// xxx: why twice for onoboarding and checking?
			},
		],
	};
};


// Additional questions for check-in survey for active recipients

export const spendingPage = (t: TFunction) => {
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

// Additional questions for offboarding survey

export const impactFinancialPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'impactFinancialIndependenceV1',
				isRequired: true,
				title: t('survey.questions.impactFinancialIndependenceTitleV1'),
				choices: yesNoChoices(t),
			},
		],
	};
};

export const impactLifePage = (t: TFunction) => {
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




// Additional questions for check-in survey for former recipients

export const moreFinancialIndependencePage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'impactFinancialIndependenceOverTimeV1',
				isRequired: true,
				title: t('survey.questions.impactFinancialIndependenceOverTimeTitleV1'),
				choices: yesNoChoices(t),
			},
		],
	};
};

export const longEnoughPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'longEnough',
				isRequired: true,
				title: t('survey.questions.longEnoughTitle'),
				choices: yesNoChoices(t),
			},
		],
	};
};

export const achievementsAchievedPage = (t: TFunction) => {
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

export const happierPage = (t: TFunction) => {
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



// Reusable choices

export const yesNoChoices = (t: TFunction) =>
	[
		[true, 'yes'],
		[false, 'no'],
	].map(([value, translationKey]) => {
		return {
			value: value,
			text: t('survey.questions.yesNoChoices.' + translationKey),
		};
	});

// xxx Should we leave this one or delete it (might be used in future surveys)
// export const ratingChoices = (t: TFunction) =>
// 	[
// 		[1, 'extremelyUnlikely'],
// 		[2, 'unlikely'],
// 		[3, 'neutral'],
// 		[4, 'likely'],
// 		[5, 'extremelyLikely'],
// 	].map(([value, translationKey]) => {
// 		return {
// 			value: value,
// 			text: t('survey.questions.ratingChoices.' + translationKey),
// 		};
// 	});

export const maritalStatusChoices = (t: TFunction) =>
	['married', 'widowed', 'divorced', 'separated', 'neverMarried'].map((key) => {
		return {
			value: key,
			text: t('survey.questions.maritalStatusChoices.' + key),
		};
	});

export const financialSituationChoices = (t: TFunction) =>
	[
		[1, 'livingComfortably'],
		[2, 'doingOk'],
		[3, 'difficultyMakingEndsMeet'],
		[4, 'barelyGettingBy'],
	].map(([value, translationKey]) => {
		return {
			value: value,
			text: t('survey.questions.financialSituationChoices.' + translationKey),
		};
	});

export const nrDependentsChoices = (t: TFunction) =>
	['1-2', '3-4', '5-7', '8-10', '10-'].map((key) => {
		return {
			value: key,
			text: t('survey.questions.nrDependentsChoices.' + key),
		};
	});
export const employmentStatusChoices = (t: TFunction) =>
	['employed', 'selfEmployed', 'notEmployed', 'retired'].map((key) => {
		return {
			value: key,
			text: t('survey.questions.employmentStatusChoices.' + key),
		};
	});

export const employedChoices = (t: TFunction) =>
	['less', 'more'].map((key) => {
		return {
			value: key,
			text: t('survey.questions.employedChoices.' + key),
		};
	});

export const livingLocationChoices = (t: TFunction) =>
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

export const spendingChoices = (t: TFunction) =>
	['education', 'food', 'housing', 'healthCare', 'mobility', 'saving', 'investment'].map((key) => {
		return {
			value: key,
			text: t('survey.questions.spendingChoices.' + key),
		};
	});
