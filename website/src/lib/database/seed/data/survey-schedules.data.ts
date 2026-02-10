import { SurveySchedule, SurveyQuestionnaire } from '@/generated/prisma/client';

export const surveySchedulesData: SurveySchedule[] = [
	{
		id: 'survey-schedule-1',
		name: 'Onboarding-1',
		questionnaire: SurveyQuestionnaire.onboarding,
		dueInMonthsAfterStart: 0,
		programId: 'program-1',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'survey-schedule-2',
		name: 'Checkin-1',
		questionnaire: SurveyQuestionnaire.checkin,
		dueInMonthsAfterStart: 6,
		programId: 'program-1',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'survey-schedule-3',
		name: 'Checkin-2',
		questionnaire: SurveyQuestionnaire.checkin,
		dueInMonthsAfterStart: 12,
		programId: 'program-1',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'survey-schedule-4',
		name: 'Checkin-3',
		questionnaire: SurveyQuestionnaire.checkin,
		dueInMonthsAfterStart: 18,
		programId: 'program-1',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'survey-schedule-5',
		name: 'Checkin-4',
		questionnaire: SurveyQuestionnaire.checkin,
		dueInMonthsAfterStart: 24,
		programId: 'program-1',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
];