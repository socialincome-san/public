import { ProgramPermission, SurveyQuestionnaire, SurveyStatus } from '@prisma/client';

export type SurveyTableViewRow = {
	id: string;
	recipientName: string;
	programId: string;
	programName: string;
	questionnaire: SurveyQuestionnaire;
	status: SurveyStatus;
	language: string;
	dueAt: Date;
	completedAt: Date | null;
	createdAt: Date;
	surveyUrl: string;
	permission: ProgramPermission;
};

export type SurveyTableView = {
	tableRows: SurveyTableViewRow[];
};
