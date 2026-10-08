// Generic set of question pages and choices
import { type Messages } from '@/lib/i18n/messages';
import { isMessageKey } from '@/lib/utils/message-keys';
import { QUESTIONS, Question } from '@/modules/surveys/survey-questions.types';
import { type useTranslations } from 'next-intl';

export type SurveyTranslator = ReturnType<typeof useTranslations<'website-survey'>>;

// Final question pages
export const welcomePage = (t: SurveyTranslator, name: string) => {
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

const getSimpleMapping = (question: Question, t: SurveyTranslator, messages: Messages): object => {
	return {
		type: question.type,
		name: question.name,
		title: t(question.translationKey),
		description: question.descriptionTranslationKey && t(question.descriptionTranslationKey),
		choices: question.choices?.length
			? translateChoices(t, messages, question.choices, question.choicesTranslationKey!)
			: undefined,
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

export const livingLocationPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('livingLocationV1'), t, messages),
				isRequired: true,
			},
		],
	};
};

export const maritalStatusPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('maritalStatusV1'), t, messages),
				isRequired: true,
			},
		],
	};
};

export const dependentsPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('hasDependentsV1'), t, messages),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('nrDependentsV1'), t, messages),
				isRequired: true,
				visibleIf: '{hasDependentsV1}=true',
			},
		],
	};
};

export const schoolAttendancePage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('schoolAttendanceV1'), t, messages),
				isRequired: true,
			},
		],
	};
};

export const employmentStatusPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('employmentStatusV1'), t, messages),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('notEmployedV1'), t, messages),
				visibleIf: '{employmentStatusV1}=notEmployed',
				isRequired: true,
			},
		],
	};
};

export const disabilityPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('disabilityV1'), t, messages),
				isRequired: true,
			},
		],
	};
};

export const skippingMealsPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('skippingMealsV1'), t, messages),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('skippingMealsLastWeekV1'), t, messages),
				visibleIf: '{skippingMealsV1}=true',
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('skippingMealsLastWeek3MealsV1'), t, messages),
				visibleIf: '{skippingMealsLastWeekV1}=true',
				isRequired: true,
			},
		],
	};
};

export const unexpectedExpensesCoveredPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('unexpectedExpensesCoveredV1'), t, messages),
				isRequired: true,
			},
		],
	};
};

export const savingsPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('savingsV1'), t, messages),
				isRequired: true,
			},
		],
	};
};

export const debtPersonalPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('debtPersonalV1'), t, messages),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('debtPersonalRepayV1'), t, messages),
				visibleIf: '{debtPersonalV1}=true',
				isRequired: true,
			},
		],
	};
};

export const debtHouseholdPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('debtHouseholdV1'), t, messages),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('debtHouseholdWhoRepaysV1'), t, messages),
				visibleIf: '{debtHouseholdV1}=true',
				isRequired: true,
			},
		],
	};
};

export const otherSupportPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('otherSupportV1'), t, messages),
				isRequired: true,
			},
		],
	};
};

export const plannedAchievementsPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('plannedAchievementV1'), t, messages),
				isRequired: true,
			},
		],
	};
};

// Additional questions for check-in survey for active recipients

export const spendingPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('spendingV1'), t, messages),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('spendingRankedV1'), t, messages),
				visibleIf: '{spendingV1.length} > 1',
				isRequired: true,
				choicesFromQuestion: 'spendingV1',
				choicesFromQuestionMode: 'selected',
			},
		],
	};
};

export const plannedAchievementsRemainingPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('plannedAchievementRemainingV1'), t, messages),
				isRequired: true,
			},
		],
	};
};

// Additional questions for offboarding survey

export const impactFinancialPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('impactFinancialIndependenceV1'), t, messages),
				isRequired: true,
			},
		],
	};
};

export const impactLifePage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('impactLifeGeneralV1'), t, messages),
				isRequired: true,
			},
		],
	};
};

export const achievementsAchievedPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('achievementsAchievedV1'), t, messages),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('achievementsNotAchievedCommentV1'), t, messages),

				visibleIf: '{achievementsAchievedV1}=false',
				isRequired: true,
			},
		],
	};
};

export const happierPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('happierV1'), t, messages),
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('happierCommentV1'), t, messages),
				visibleIf: '{happier}=true',
				isRequired: true,
			},
			{
				...getSimpleMapping(getQuestion('notHappierCommentV1'), t, messages),
				visibleIf: '{happierCommentV1}=false',
				isRequired: true,
			},
		],
	};
};

export const longEnoughPage = (t: SurveyTranslator, messages: Messages) => {
	return {
		elements: [
			{
				...getSimpleMapping(getQuestion('longEnough'), t, messages),
				isRequired: true,
			},
		],
	};
};

const translateChoices = (t: SurveyTranslator, messages: Messages, choices: unknown[], choicesTranslationKey: string) =>
	choices.map((key) => {
		const textKey = `${choicesTranslationKey}.${String(key)}`;

		return {
			value: key,
			text: isMessageKey(messages, 'website-survey', textKey) ? t(textKey) : textKey,
		};
	});
