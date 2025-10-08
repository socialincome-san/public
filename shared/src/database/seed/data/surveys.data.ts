import { Prisma, SurveyQuestionnaire, SurveyStatus } from '@prisma/client';

export const surveysData: Prisma.SurveyCreateManyInput[] = [
	{
		id: 'survey-1',
		recipientId: 'recipient-1',
		questionnaire: SurveyQuestionnaire.onboarding,
		language: 'en',
		dueAt: new Date('2024-04-15'),
		sentAt: new Date('2024-04-10'),
		completedAt: new Date('2024-04-14'),
		status: SurveyStatus.completed,
		comments: 'Recipient was satisfied with onboarding.',
		data: { satisfaction: 5, comment: 'Very happy with the support.' } as Prisma.InputJsonValue,
		accessEmail: 'recipient1@survey.org',
		accessPw: 'onboard123',
		accessToken: 'token-1',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'survey-2',
		recipientId: 'recipient-2',
		questionnaire: SurveyQuestionnaire.checkin,
		language: 'en',
		dueAt: new Date('2024-05-15'),
		sentAt: new Date('2024-05-10'),
		completedAt: null,
		status: SurveyStatus.sent,
		comments: null,
		data: {} as Prisma.InputJsonValue,
		accessEmail: 'recipient2@survey.org',
		accessPw: 'checkin123',
		accessToken: 'token-2',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'survey-3',
		recipientId: 'recipient-3',
		questionnaire: SurveyQuestionnaire.offboarding,
		language: 'en',
		dueAt: new Date('2024-06-15'),
		sentAt: new Date('2024-06-10'),
		completedAt: null,
		status: SurveyStatus.scheduled,
		comments: null,
		data: {} as Prisma.InputJsonValue,
		accessEmail: 'recipient3@survey.org',
		accessPw: 'exit123',
		accessToken: 'token-3',
		createdAt: new Date(),
		updatedAt: null
	}
];