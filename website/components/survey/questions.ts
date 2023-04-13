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

export const maritalStatusPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'maritalStatus',
				isRequired: true,
				title: t('survey.questions.maritalStatusTitle'),
				choices: maritalStatusChoices(t),
			},
		],
	};
};

export const financialSituationPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'financialSituation',
				isRequired: true,
				title: t('survey.questions.financialSituationTitle'),
				choices: financialSituationChoices(t),
			},
		],
	};
};

export const employmentStatusPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'employmentStatus',
				isRequired: true,
				title: t('survey.questions.employmentStatusTitle'),
				choices: employmentStatusChoices(t),
			},
			{
				type: 'radiogroup',
				name: 'notEmployed',
				visibleIf: '{employmentStatus}=notEmployed',
				title: t('survey.questions.notEmployedTitle'),
				isRequired: true,
				choices: yesNoChoices(t),
			},
			{
				type: 'radiogroup',
				name: 'employed',
				visibleIf: '{employmentStatus}=employed or {employmentStatus}=selfEmployed',
				title: t('survey.questions.employedTitle'),
				isRequired: true,
				choices: employedChoices(t),
			},
		],
	};
};

export const disabilityPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'disability',
				isRequired: true,
				title: t('survey.questions.disabilityTitle'),
				choices: yesNoChoices(t),
			},
		],
	};
};

export const livingLocationPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'livingLocation',
				isRequired: true,
				title: t('survey.questions.livingLocationTitle'),
				choices: livingLocationChoices(t),
			},
		],
	};
};

export const dependentsPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'hasDependents',
				isRequired: true,
				title: t('survey.questions.hasDependentsTitle'),
				description: t('survey.questions.hasDependentsDesc'),
				choices: yesNoChoices(t),
			},
			{
				type: 'radiogroup',
				name: 'nrDependents',
				isRequired: true,
				title: t('survey.questions.nrDependentsTitle'),
				visibleIf: '{hasDependents}=true',
				choices: nrDependentsChoices(t),
			},
		],
	};
};

export const basicNeedsCoveragePage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'basicNeedsCoverage',
				isRequired: true,
				title: t('survey.questions.basicNeedsCoverageTitle'),
				choices: ratingChoices(t),
			},
		],
	};
};

export const expensesCoveredPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'expensesCovered',
				isRequired: true,
				title: t('survey.questions.expensesCoveredTitle'),
				choices: ratingChoices(t),
			},
		],
	};
};

export const ownIncomePage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'ownIncome',
				isRequired: true,
				title: t('survey.questions.ownIncomeTitle'),
				choices: ratingChoices(t),
			},
		],
	};
};

export const unexpectedExpensesCoveredPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'unexpectedExpensesCovered',
				isRequired: true,
				title: t('survey.questions.unexpectedExpensesCoveredTitle'),
				choices: ratingChoices(t),
			},
		],
	};
};

export const educationAccessPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'educationAccess',
				isRequired: true,
				title: t('survey.questions.educationAccessTitle'),
				choices: ratingChoices(t),
			},
		],
	};
};

export const savingsPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'savings',
				isRequired: true,
				title: t('survey.questions.savingsTitle'),
				choices: ratingChoices(t),
			},
		],
	};
};

export const deptPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'dept',
				isRequired: true,
				title: t('survey.questions.deptTitle'),
				choices: yesNoChoices(t),
			},
			{
				type: 'radiogroup',
				name: 'mainDeptPayer',
				visibleIf: '{dept}=true',
				title: t('survey.questions.mainDeptPayerTitle'),
				isRequired: true,
				choices: yesNoChoices(t),
			},
		],
	};
};

export const spendingPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'checkbox',
				name: 'spending',
				isRequired: true,
				title: t('survey.questions.spendingTitle'),
				choices: spendingChoices(t),
			},
			{
				type: 'ranking',
				name: 'spendingRanked',
				title: t('survey.questions.spendingRankingTitle'),
				description: t('survey.questions.spendingRankingDesc'),
				visibleIf: '{spending.length} > 1',
				isRequired: true,
				choicesFromQuestion: 'spending',
				choicesFromQuestionMode: 'selected',
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
				title: isOnboarding
					? t('survey.questions.plannedAchievementOnboardingTitle')
					: t('survey.questions.plannedAchievementCheckingTitle'),
			},
		],
	};
};

export const achievementsAchievedPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'achievementsAchieved',
				isRequired: true,
				title: t('survey.questions.achievementsAchievedTitle'),
				choices: yesNoChoices(t),
			},
			{
				type: 'comment',
				name: 'achievementsNotAchievedComment',
				visibleIf: '{achievementsAchieved}=false',
				title: t('survey.questions.achievementsNotAchievedCommentTitle'),
				isRequired: true,
			},
		],
	};
};

export const moreFinanciallySecurePage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'moreFinanciallySecure',
				isRequired: true,
				title: t('survey.questions.moreFinanciallySecureTitle'),
				choices: yesNoChoices(t),
			},
		],
	};
};

export const happierPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'happier',
				isRequired: true,
				title: t('survey.questions.happierTitle'),
				choices: yesNoChoices(t),
			},
			{
				type: 'comment',
				name: 'happierComment',
				visibleIf: '{happier}=true',
				title: t('survey.questions.happierCommentTitle'),
				isRequired: true,
			},
			{
				type: 'comment',
				name: 'notHappierComment',
				visibleIf: '{happier}=false',
				title: t('survey.questions.notHappierCommentTitle'),
				isRequired: true,
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

export const selfSustainablePage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'selfSustainable',
				isRequired: true,
				title: t('survey.questions.selfSustainableTitle'),
				choices: yesNoChoices(t),
			},
			{
				type: 'comment',
				name: 'notSelfSustainableComment',
				visibleIf: '{selfSustainable}=false',
				title: t('survey.questions.notSelfSustainableCommentTitle'),
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

export const ratingChoices = (t: TFunction) =>
	[
		[1, 'extremelyUnlikely'],
		[2, 'unlikely'],
		[3, 'neutral'],
		[4, 'likely'],
		[5, 'extremelyLikely'],
	].map(([value, translationKey]) => {
		return {
			value: value,
			text: t('survey.questions.ratingChoices.' + translationKey),
		};
	});

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
