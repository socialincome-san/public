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
				type: 'text',
				name: 'nrDependents',
				visibleIf: '{hasDependents}=true',
				title: t('survey.questions.nrDependentsTitle'),
				isRequired: true,
				inputType: 'number',
				min: 0,
				max: 50,
				step: 1,
			},
		],
	};
};

export const basicNeedsCoveragePage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'basicNeedsCoverge',
				isRequired: true,
				title: t('survey.questions.basicNeedsCovergeTitle'),
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
				description: t('survey.questions.deptDesc'),
				choices: yesNoChoices(t),
			},
		],
	};
};

// todo why do they need to be 3 in the current questionnaire?
// currently is "Can you point out the three things you spend your Social Income money on?This question is required.*
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
		],
	};
};

export const plannedAchievementsPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'comment',
				name: 'plannedAchievement',
				isRequired: true,
				title: t('survey.questions.plannedAchievementTitle'),
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

export const employmentStatusChoices = (t: TFunction) =>
	[
		'selfEmployed',
		'employedPartTime',
		'employedFullTime',
		'notEmployedLookingForWork',
		'notEmployedNotLookingForWork',
		'retired',
		'disabled',
	].map((key) => {
		return {
			value: key,
			text: t('survey.questions.employmentStatusChoices.' + key),
		};
	});

export const livingLocationChoices = (t: TFunction) =>
	[
		'westernAreaUrbanFreetown',
		'westernAreaRural',
		'easternProvince',
		'northernProvince',
		'northWestProvince',
		'southernProvince',
	].map((key) => {
		return {
			value: key,
			text: t('survey.questions.livingLocationChoices.' + key),
		};
	});

// todo check choices. What about e.g investments into agriculture?
export const spendingChoices = (t: TFunction) =>
	['healthCare', 'saving', 'food', 'housing', 'education', 'mobility'].map((key) => {
		return {
			value: key,
			text: t('survey.questions.spendingChoices.' + key),
		};
	});
