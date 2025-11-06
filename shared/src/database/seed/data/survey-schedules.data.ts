import { SurveySchedule, SurveyQuestionnaire } from '@prisma/client';

export const surveySchedulesData: SurveySchedule[] = [
	{
		id: 'survey-schedule-1',
		questionnaire: SurveyQuestionnaire.onboarding,
		dueInMonthsAfterStart: 0,
		programId: 'program-1',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'survey-schedule-2',
		questionnaire: SurveyQuestionnaire.checkin,
		dueInMonthsAfterStart: 6,
		programId: 'program-1',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'survey-schedule-3',
		questionnaire: SurveyQuestionnaire.checkin,
		dueInMonthsAfterStart: 12,
		programId: 'program-1',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'survey-schedule-4',
		questionnaire: SurveyQuestionnaire.checkin,
		dueInMonthsAfterStart: 18,
		programId: 'program-1',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'survey-schedule-5',
		questionnaire: SurveyQuestionnaire.checkin,
		dueInMonthsAfterStart: 24,
		programId: 'program-1',
		createdAt: new Date(),
		updatedAt: null
	},
];