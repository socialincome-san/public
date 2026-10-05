import type { CountryCode, Gender, SurveyQuestionnaire, SurveyStatus } from '@/generated/prisma/enums';
import type { RecipientAgeGroup } from '@/lib/constants/recipient-age-groups';
import type { Question } from '@/lib/types/question';

export type SurveyJsonValue = string | number | boolean | null | SurveyJsonObject | SurveyJsonValue[];

type SurveyJsonObject = {
	[key: string]: SurveyJsonValue;
};

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
};

export type SurveyTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	programId?: string;
};

export type SurveyPaginatedTableView = {
	tableRows: SurveyTableViewRow[];
	totalCount: number;
	programFilterOptions: SurveyProgramFilterOption[];
};

type SurveyProgramFilterOption = {
	id: string;
	name: string;
};

export type SurveyCreateData = {
	name: string;
	recipientId: string;
	questionnaire: SurveyQuestionnaire;
	language: string;
	dueAt: Date;
	status: SurveyStatus;
	data: SurveyJsonObject;
	accessEmail: string;
	accessPw: string;
	surveyScheduleId?: string;
};

export type SurveyUpdateData = {
	name?: string;
	questionnaire?: SurveyQuestionnaire;
	language?: string;
	dueAt?: Date;
	status?: SurveyStatus;
	data?: SurveyJsonObject;
	accessEmail?: string;
	accessPw?: string;
	completedAt?: Date | null;
	recipientId?: string;
	surveyScheduleId?: string;
};

export type SurveyResponseUpdateInput = {
	data?: SurveyJsonObject;
	status?: SurveyStatus;
	completedAt?: Date | null;
};

export type SurveyPayload = {
	id: string;
	name: string;
	questionnaire: SurveyQuestionnaire;
	language: string;
	dueAt: Date;
	completedAt: Date | null;
	status: SurveyStatus;
	data: SurveyJsonValue;
	accessEmail: string;
	accessPw: string;
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
	data: SurveyJsonValue;
	nameOfRecipient: string;
};

export type SurveySchedulePayload = {
	id: string;
	name: string;
	questionnaire: SurveyQuestionnaire;
	dueInMonthsAfterStart: number;
	programId: string;
	createdAt: Date;
	updatedAt: Date | null;
};

export type SurveyGenerationPreviewResult = {
	surveys: SurveyCreateData[];
};

export type SurveyGenerationResult = {
	surveysCreated: number;
	message: string;
};

export type SurveyImpactFilters = {
	questionnaires?: SurveyQuestionnaire[];
	focusIds?: string[];
	programIds?: string[];
	countryIsoCodes?: CountryCode[];
	language?: string;
	recipientGenders?: Gender[];
	recipientAgeGroups?: SurveyImpactRecipientAgeGroup[];
};

export type SurveyImpactRecipientAgeGroup = RecipientAgeGroup;

type SurveyImpactOption = {
	value: string;
	count: number;
	percentage: number;
};

export type SurveyImpactQuestion = {
	name: string;
	inputType: string;
	translationKey: string;
	descriptionTranslationKey?: string;
	choicesTranslationKey?: string;
	questionnaires: SurveyQuestionnaire[];
	answeredCount: number;
	surveyCount: number;
	options: SurveyImpactOption[];
};

export type SurveyImpactData = {
	totalCompletedSurveys: number;
	totalRecipients: number;
	totalCountries: number;
	totalPrograms: number;
	totalQuestionnaires: number;
	questions: SurveyImpactQuestion[];
};

export type SurveyImpactStudyDetailItem = {
	value: string;
	count: number;
	percentage: number;
};

export type SurveyImpactStudyDetails = {
	totalCompletedSurveys: number;
	totalRecipients: number;
	lastResponseDaysAgo: number | null;
	timeFrameStart: Date | null;
	timeFrameEnd: Date | null;
	timeFrameDays: number | null;
	countryBreakdown: SurveyImpactStudyDetailItem[];
	genderBreakdown: SurveyImpactStudyDetailItem[];
	ageBreakdown: SurveyImpactStudyDetailItem[];
};

type SurveyImpactFilterOption = {
	value: string;
	label: string;
};

export type SurveyImpactFilterOptions = {
	countries: SurveyImpactFilterOption[];
	focuses: SurveyImpactFilterOption[];
	programs: SurveyImpactFilterOption[];
	questionnaires: SurveyImpactFilterOption[];
};

export type QuestionDefinition = Question;

export type AnswerRecord = Record<string, SurveyJsonValue>;

export type SurveyAnswerRecord = {
	questionnaire: SurveyQuestionnaire;
	answers: AnswerRecord;
};

export type SurveyImpactQuery = Omit<SurveyImpactFilters, 'recipientAgeGroups'> & {
	recipientBirthDateRanges?: {
		gte?: Date;
		lte?: Date;
	}[];
};
