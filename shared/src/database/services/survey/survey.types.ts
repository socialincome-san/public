import { Prisma, ProgramPermission, SurveyQuestionnaire, SurveyStatus } from '@prisma/client';

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

export type SurveyCreateInput = {
	recipient: { connect: { id: string } };
	questionnaire: SurveyQuestionnaire;
	language: string;
	dueAt: Date;
	status: SurveyStatus;
	data: Prisma.InputJsonValue;
	accessEmail: string;
	accessPw: string;
	accessToken: string;
	surveySchedule?: { connect: { id: string } };
};

export type SurveyUpdateInput = {
	questionnaire?: SurveyQuestionnaire;
	language?: string;
	dueAt?: Date;
	status?: SurveyStatus;
	data?: Prisma.InputJsonValue;
	accessEmail?: string;
	accessPw?: string;
	accessToken?: string;
	completedAt?: Date | null;
	recipient?: { connect: { id: string } };
	surveySchedule?: { connect: { id: string } };
};

export type SurveyPayload = {
	id: string;
	questionnaire: SurveyQuestionnaire;
	language: string;
	dueAt: Date;
	completedAt: Date | null;
	status: SurveyStatus;
	data: Prisma.JsonValue;
	accessEmail: string;
	accessPw: string;
	accessToken: string;
	recipientId: string;
	surveyScheduleId: string | null;
	createdAt: Date;
	updatedAt: Date | null;
};

export type SurveyPreview = {
	questionnaire: SurveyQuestionnaire;
	language: string;
	dueAt: Date;
	status: SurveyStatus;
	recipientId: string;
	recipientName: string;
	surveyScheduleId: string;
	programId: string;
	programName: string;
};

export type SurveyGenerationPreviewResult = {
	surveys: SurveyCreateInput[];
};

export type SurveyGenerationResult = {
	surveysCreated: number;
	message: string;
};
