import { Survey as PrismaSurvey, SurveyQuestionnaire, SurveyStatus, RecipientMainLanguage } from '@prisma/client';
import { PROGRAM1_ID, PROGRAM2_ID, PROGRAM3_ID } from './programs';
import { recipientsData } from './recipients';

const now = new Date();

const makeSurvey = (
	i: number,
	recipientId: string,
	programId: string,
	questionnaire: SurveyQuestionnaire,
	status: SurveyStatus,
	language: RecipientMainLanguage,
	offsetDays: number
): PrismaSurvey => ({
	id: `survey-${i}`,
	recipientId,
	recipientName: `Recipient ${i}`,
	questionnaire,
	language,
	dueDateAt: new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000),
	sentAt: status === 'new' ? null : new Date(now.getTime() - offsetDays * 24 * 60 * 60 * 1000),
	completedAt: status === 'completed' ? new Date(now.getTime() - offsetDays * 12 * 60 * 60 * 1000) : null,
	status,
	comments: null,
	data: '{}',
	accessEmail: `survey-${i}@example.com`,
	accessPw: `pw-${i}`,
	accessToken: `token-${i}`,
	programId,
	createdAt: now,
	updatedAt: null,
});

export const surveysData: PrismaSurvey[] = [
	makeSurvey(1, recipientsData[0].id, PROGRAM1_ID, 'onboarding', 'new', 'en', 7),
	makeSurvey(2, recipientsData[1].id, PROGRAM1_ID, 'checkin', 'sent', 'kri', 14),
	makeSurvey(3, recipientsData[2].id, PROGRAM2_ID, 'offboarding', 'in_progress', 'en', 30),
	makeSurvey(4, recipientsData[3].id, PROGRAM2_ID, 'checkin', 'completed', 'kri', -10),
	makeSurvey(5, recipientsData[4].id, PROGRAM3_ID, 'onboarding', 'scheduled', 'en', 21),
	makeSurvey(6, recipientsData[5].id, PROGRAM3_ID, 'offboarded_checkin', 'missed', 'kri', -5),
];