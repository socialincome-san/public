import { Prisma, Survey, SurveyQuestionnaire, SurveyStatus } from '@/generated/prisma/client';
import { LanguageCode } from '@/lib/types/language';
import { recipientsData } from './recipients.data';
import { surveySchedulesData } from './survey-schedules.data';

type RecipientId = (typeof recipientsData)[number]['id'];
type SurveyScheduleId = (typeof surveySchedulesData)[number]['id'];

type SurveySeed = {
	id: Survey['id'];
	name: Survey['name'];
	questionnaire: SurveyQuestionnaire;
	language: LanguageCode;
	dueAt: Survey['dueAt'];
	completedAt: Survey['completedAt'];
	status: SurveyStatus;
	data: Prisma.InputJsonValue;
	accessEmail: Survey['accessEmail'];
	accessPw: Survey['accessPw'];
	recipientId: RecipientId;
	surveyScheduleId: SurveyScheduleId | null;
};

const surveySeeds: readonly SurveySeed[] = [
	{
		id: 'survey-recipient-core-sl-active-onboarding',
		name: 'recipient_core_sl_active_onboarding',
		questionnaire: SurveyQuestionnaire.onboarding,
		language: 'kri',
		dueAt: new Date('2024-10-15T00:00:00.000Z'),
		completedAt: new Date('2024-10-18T00:00:00.000Z'),
		status: SurveyStatus.completed,
		data: { householdSize: 4, baselineIncome: 'low' },
		accessEmail: 'core-active@survey.test',
		accessPw: 'seed-survey-pw',
		recipientId: 'recipient-core-sl-active',
		surveyScheduleId: 'survey-schedule-core-sl-onboarding',
	},
	{
		id: 'survey-recipient-core-sl-future-onboarding',
		name: 'recipient_core_sl_future_onboarding',
		questionnaire: SurveyQuestionnaire.onboarding,
		language: 'kri',
		dueAt: new Date('2025-04-05T00:00:00.000Z'),
		completedAt: null,
		status: SurveyStatus.new,
		data: { householdSize: 3, baselineIncome: 'very_low' },
		accessEmail: 'core-future@survey.test',
		accessPw: 'seed-survey-pw',
		recipientId: 'recipient-core-sl-future',
		surveyScheduleId: 'survey-schedule-core-sl-onboarding',
	},
	{
		id: 'survey-recipient-resilience-lr-active-onboarding',
		name: 'recipient_resilience_lr_active_onboarding',
		questionnaire: SurveyQuestionnaire.onboarding,
		language: 'en',
		dueAt: new Date('2024-10-10T00:00:00.000Z'),
		completedAt: new Date('2024-10-17T00:00:00.000Z'),
		status: SurveyStatus.completed,
		data: { householdSize: 5, baselineIncome: 'low' },
		accessEmail: 'resilience-active@survey.test',
		accessPw: 'seed-survey-pw',
		recipientId: 'recipient-resilience-lr-active',
		surveyScheduleId: 'survey-schedule-resilience-lr-onboarding',
	},
	{
		id: 'survey-recipient-health-lr-future-onboarding',
		name: 'recipient_health_lr_future_onboarding',
		questionnaire: SurveyQuestionnaire.onboarding,
		language: 'en',
		dueAt: new Date('2025-04-12T00:00:00.000Z'),
		completedAt: null,
		status: SurveyStatus.scheduled,
		data: { householdSize: 2, baselineIncome: 'very_low' },
		accessEmail: 'health-future@survey.test',
		accessPw: 'seed-survey-pw',
		recipientId: 'recipient-health-lr-future',
		surveyScheduleId: 'survey-schedule-health-lr-onboarding',
	},
	{
		id: 'survey-recipient-candidate-sl-1-intake',
		name: 'candidate_sl_1_intake',
		questionnaire: SurveyQuestionnaire.onboarding,
		language: 'kri',
		dueAt: new Date('2025-02-05T00:00:00.000Z'),
		completedAt: null,
		status: SurveyStatus.new,
		data: { candidate: true, intakeStep: 'local_partner_review' },
		accessEmail: 'candidate-sl-1@survey.test',
		accessPw: 'seed-survey-pw',
		recipientId: 'candidate-sl-1',
		surveyScheduleId: null,
	},
	{
		id: 'survey-recipient-candidate-lr-1-intake',
		name: 'candidate_lr_1_intake',
		questionnaire: SurveyQuestionnaire.onboarding,
		language: 'en',
		dueAt: new Date('2025-02-06T00:00:00.000Z'),
		completedAt: null,
		status: SurveyStatus.new,
		data: { candidate: true, intakeStep: 'local_partner_review' },
		accessEmail: 'candidate-lr-1@survey.test',
		accessPw: 'seed-survey-pw',
		recipientId: 'candidate-lr-1',
		surveyScheduleId: null,
	},
];

export const surveysData: Prisma.SurveyCreateManyInput[] = surveySeeds.map(
	({
		id,
		name,
		questionnaire,
		language,
		dueAt,
		completedAt,
		status,
		data,
		accessEmail,
		accessPw,
		recipientId,
		surveyScheduleId,
	}) => ({
		id,
		name,
		legacyFirestoreId: null,
		questionnaire,
		language,
		dueAt,
		completedAt,
		status,
		data,
		accessEmail,
		accessPw,
		recipientId,
		surveyScheduleId,
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	}),
);
