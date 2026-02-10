import { Prisma, ProgramPermission, SurveyQuestionnaire, SurveyStatus } from '@/generated/prisma/client';

export type SurveyTableViewRow = {
	id: string;
	name: string;
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
	name: string;
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
	name?: string;
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
	name: string;
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

export type SurveyWithRecipient = {
	id: string;
	name: string;
	questionnaire: SurveyQuestionnaire;
	language: string;
	status: SurveyStatus;
	data: Prisma.JsonValue;
	nameOfRecipient: string;
};

export type SurveyGenerationPreviewResult = {
	surveys: SurveyCreateInput[];
};

export type SurveyGenerationResult = {
	surveysCreated: number;
	message: string;
};
