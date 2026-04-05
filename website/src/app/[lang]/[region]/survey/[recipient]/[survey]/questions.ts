// Generic set of question pages and choices
import { TranslateFunction } from '@/lib/i18n/translator';
import { QUESTIONS, Question } from '@/lib/types/question';

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

const getSimpleMapping = (question: Question, t: TranslateFunction): object => {
	return {
		type: question.type,
		name: question.name,
		title: t(question.translationKey),
		description: question.descriptionTranslationKey && t(question.descriptionTranslationKey),
		choices: question.choices?.length ? translateChoices(t, question.choices, question.choicesTranslationKey!) : undefined,
	};
};

const questionsByName = new Map(QUESTIONS.map((question) => [question.name, question]));

const getQuestion = (name: Question['name']): Question => {
	const question = questionsByName.get(name);
	if (!question) {
		throw new Error(`Question not found: ${name}`);
	}

	return question;
};

export const livingLocationPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('livingLocationV1'), t),
				isRequired: true,
			},
		],
	};
};

export const maritalStatusPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('maritalStatusV1'), t),
				isRequired: true,
			},
		],
	};
};

export const dependentsPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('hasDependentsV1'), t),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('nrDependentsV1'), t),
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
				...getSimpleMapping(getQuestion('schoolAttendanceV1'), t),
				isRequired: true,
			},
		],
	};
};

export const employmentStatusPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('employmentStatusV1'), t),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('notEmployedV1'), t),
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
				...getSimpleMapping(getQuestion('disabilityV1'), t),
				isRequired: true,
			},
		],
	};
};

export const skippingMealsPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('skippingMealsV1'), t),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('skippingMealsLastWeekV1'), t),
				visibleIf: '{skippingMealsV1}=true',
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('skippingMealsLastWeek3MealsV1'), t),
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
				...getSimpleMapping(getQuestion('unexpectedExpensesCoveredV1'), t),
				isRequired: true,
			},
		],
	};
};

export const savingsPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('savingsV1'), t),
				isRequired: true,
			},
		],
	};
};

export const debtPersonalPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('debtPersonalV1'), t),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('debtPersonalRepayV1'), t),
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
				...getSimpleMapping(getQuestion('debtHouseholdV1'), t),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('debtHouseholdWhoRepaysV1'), t),
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
				...getSimpleMapping(getQuestion('otherSupportV1'), t),
				isRequired: true,
			},
		],
	};
};

export const plannedAchievementsPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('plannedAchievementV1'), t),
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
				...getSimpleMapping(getQuestion('spendingV1'), t),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('spendingRankedV1'), t),
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
				...getSimpleMapping(getQuestion('plannedAchievementRemainingV1'), t),
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
				...getSimpleMapping(getQuestion('impactFinancialIndependenceV1'), t),
				isRequired: true,
			},
		],
	};
};

export const impactLifePage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('impactLifeGeneralV1'), t),
				isRequired: true,
			},
		],
	};
};

export const achievementsAchievedPage = (t: TranslateFunction) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('achievementsAchievedV1'), t),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('achievementsNotAchievedCommentV1'), t),

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
				...getSimpleMapping(getQuestion('happierV1'), t),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('happierCommentV1'), t),
				visibleIf: '{happier}=true',
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('notHappierCommentV1'), t),
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
				...getSimpleMapping(getQuestion('longEnough'), t),
				isRequired: true,
			},
		],
	};
};

const translateChoices = (t: TranslateFunction, choices: unknown[], choicesTranslationKey: string) =>
	choices.map((key) => {
		return {
			value: key,
			text: t(`${choicesTranslationKey}.${String(key)}`),
		};
	});
