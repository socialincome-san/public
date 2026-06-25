import { SurveyQuestionnaire } from '@/generated/prisma/client';

export const questionTypeLabelKeys: Record<string, string> = {
	checkbox: 'survey.impactMeasurement.questionTypes.multipleChoice',
	radiogroup: 'survey.impactMeasurement.questionTypes.singleChoice',
	ranking: 'survey.impactMeasurement.questionTypes.ranking',
	comment: 'survey.impactMeasurement.questionTypes.freeText',
};

export const highlightedQuestionOrder = ['spendingV1', 'hasDependentsV1'];

export const followUpConfigs: Record<string, { childName: string; triggerValue?: string; triggerDescription?: string }[]> = {
	hasDependentsV1: [{ childName: 'nrDependentsV1', triggerValue: 'true' }],
	employmentStatusV1: [{ childName: 'notEmployedV1', triggerValue: 'notEmployed' }],
	skippingMealsV1: [{ childName: 'skippingMealsLastWeekV1', triggerValue: 'true' }],
	skippingMealsLastWeekV1: [{ childName: 'skippingMealsLastWeek3MealsV1', triggerValue: 'true' }],
	debtPersonalV1: [{ childName: 'debtPersonalRepayV1', triggerValue: 'true' }],
	debtHouseholdV1: [{ childName: 'debtHouseholdWhoRepaysV1', triggerValue: 'true' }],
	spendingV1: [
		{ childName: 'spendingRankedV1', triggerDescription: 'survey.impactMeasurement.followUp.selectedMoreThanOneCategory' },
	],
	achievementsAchievedV1: [{ childName: 'achievementsNotAchievedCommentV1', triggerValue: 'false' }],
	happierV1: [
		{ childName: 'happierCommentV1', triggerValue: 'true' },
		{ childName: 'notHappierCommentV1', triggerValue: 'false' },
	],
};

export const questionnaireLabelKeys: Record<SurveyQuestionnaire, string> = {
	onboarding: 'survey.impactMeasurement.questionnaires.onboarding',
	checkin: 'survey.impactMeasurement.questionnaires.checkin',
	offboarding: 'survey.impactMeasurement.questionnaires.offboarding',
	offboarded_checkin: 'survey.impactMeasurement.questionnaires.offboardedCheckin',
};
