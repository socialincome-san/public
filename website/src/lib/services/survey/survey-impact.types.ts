import { CountryCode, Gender, Prisma, SurveyQuestionnaire } from '@/generated/prisma/client';
import { RecipientAgeGroup } from '@/lib/constants/recipient-age-groups';
import { Question } from '@/lib/types/question';

export type SurveyImpactFilters = {
	questionnaires?: SurveyQuestionnaire[];
	programIds?: string[];
	countryIsoCodes?: CountryCode[];
	language?: string;
	recipientGenders?: Gender[];
	recipientAgeGroups?: SurveyImpactRecipientAgeGroup[];
};

export type SurveyImpactRecipientAgeGroup = RecipientAgeGroup;

export type SurveyImpactOption = {
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

export type SurveyImpactFilterOption = {
	value: string;
	label: string;
};

export type SurveyImpactFilterOptions = {
	countries: SurveyImpactFilterOption[];
	programs: SurveyImpactFilterOption[];
	questionnaires: SurveyImpactFilterOption[];
};

export type QuestionDefinition = Question;

export type AnswerRecord = Record<string, Prisma.JsonValue>;

export type SurveyAnswerRecord = {
	questionnaire: SurveyQuestionnaire;
	answers: AnswerRecord;
};

