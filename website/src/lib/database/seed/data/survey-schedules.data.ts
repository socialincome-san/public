import { SurveyQuestionnaire, SurveySchedule } from '@/generated/prisma/client';
import { programsData } from './programs.data';

const createdAt = new Date('2025-01-01T13:00:00.000Z');

type ProgramId = (typeof programsData)[number]['id'];
type SurveyScheduleSeed = {
	id: SurveySchedule['id'];
	name: SurveySchedule['name'];
	questionnaire: SurveyQuestionnaire;
	dueInMonthsAfterStart: number;
	programId: ProgramId;
};

const surveyScheduleSeeds: readonly SurveyScheduleSeed[] = [
	{
		id: 'survey-schedule-core-sl-onboarding',
		name: 'core_sl_onboarding',
		questionnaire: SurveyQuestionnaire.onboarding,
		dueInMonthsAfterStart: 0,
		programId: 'program-si-core-sl',
	},
	{
		id: 'survey-schedule-core-sl-checkin',
		name: 'core_sl_checkin_6m',
		questionnaire: SurveyQuestionnaire.checkin,
		dueInMonthsAfterStart: 6,
		programId: 'program-si-core-sl',
	},
	{
		id: 'survey-schedule-women-sl-onboarding',
		name: 'women_sl_onboarding',
		questionnaire: SurveyQuestionnaire.onboarding,
		dueInMonthsAfterStart: 0,
		programId: 'program-si-women-support-sl',
	},
	{
		id: 'survey-schedule-education-sl-onboarding',
		name: 'education_sl_onboarding',
		questionnaire: SurveyQuestionnaire.onboarding,
		dueInMonthsAfterStart: 0,
		programId: 'program-si-education-sl',
	},
	{
		id: 'survey-schedule-livelihood-gh-onboarding',
		name: 'livelihood_gh_onboarding',
		questionnaire: SurveyQuestionnaire.onboarding,
		dueInMonthsAfterStart: 0,
		programId: 'program-si-livelihood-gh',
	},
	{
		id: 'survey-schedule-education-gh-onboarding',
		name: 'education_gh_onboarding',
		questionnaire: SurveyQuestionnaire.onboarding,
		dueInMonthsAfterStart: 0,
		programId: 'program-si-education-gh',
	},
	{
		id: 'survey-schedule-resilience-lr-onboarding',
		name: 'resilience_lr_onboarding',
		questionnaire: SurveyQuestionnaire.onboarding,
		dueInMonthsAfterStart: 0,
		programId: 'program-si-resilience-lr',
	},
	{
		id: 'survey-schedule-health-lr-onboarding',
		name: 'health_lr_onboarding',
		questionnaire: SurveyQuestionnaire.onboarding,
		dueInMonthsAfterStart: 0,
		programId: 'program-si-health-lr',
	},
	{
		id: 'survey-schedule-somaha-lr-onboarding',
		name: 'somaha_lr_onboarding',
		questionnaire: SurveyQuestionnaire.onboarding,
		dueInMonthsAfterStart: 0,
		programId: 'program-somaha-community-lr',
	},
];

export const surveySchedulesData: SurveySchedule[] = surveyScheduleSeeds.map(
	({ id, name, questionnaire, dueInMonthsAfterStart, programId }) => ({
		id,
		name,
		questionnaire,
		dueInMonthsAfterStart,
		programId,
		createdAt,
		updatedAt: null,
	}),
);
