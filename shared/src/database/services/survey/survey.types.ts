import { Survey as PrismaSurvey, RecipientMainLanguage, SurveyQuestionnaire, SurveyStatus } from '@prisma/client';

export type CreateSurveyInput = Omit<PrismaSurvey, 'id' | 'createdAt' | 'updatedAt'>;

export type ProgramPermission = 'operator' | 'viewer';

export type SurveyTableViewRow = {
	id: string;
	questionnaire: SurveyQuestionnaire;
	status: SurveyStatus;
	recipientName: string;
	language: RecipientMainLanguage;
	dueDateAt: Date;
	dueDateAtFormatted: string;
	sentAt: Date | null;
	sentAtFormatted: string | null;
	programName: string;
	permission: ProgramPermission;
};

export type SurveyTableView = {
	tableRows: SurveyTableViewRow[];
};
