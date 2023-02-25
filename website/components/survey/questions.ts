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
				type: 'text',
				name: 'dependents',
				isRequired: true,
				title: t('survey.questions.dependentsTitle'),
				description: t('survey.questions.dependentsDesc'),
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

export const noHelpPage = (t: TFunction) => {
	return {
		elements: [
			{
				type: 'radiogroup',
				name: 'noHelp',
				isRequired: true,
				title: t('survey.questions.noHelpTitle'),
				choices: yesNoChoices(t),
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
