import { ProgramPermission, SurveyQuestionnaire, SurveyStatus } from '@prisma/client';

export type SurveyTableViewRow = {
	id: string;
	questionnaire: SurveyQuestionnaire;
	status: SurveyStatus;
	recipientName: string;
	language: string;
	dueDateAt: Date;
	dueDateAtFormatted: string;
	programName: string;
	programId: string;
	permission: ProgramPermission;
};

export type SurveyTableView = {
	tableRows: SurveyTableViewRow[];
};

export type UpcomingSurveyTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	questionnaire: SurveyQuestionnaire;
	dueDateAt: Date;
	dueDateAtFormatted: string;
	status: SurveyStatus;
	url: string;
	programName: string;
	permission: ProgramPermission;
};

export type UpcomingSurveyTableView = {
	tableRows: UpcomingSurveyTableViewRow[];
};
