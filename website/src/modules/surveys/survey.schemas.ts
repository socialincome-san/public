import { SurveyQuestionnaire, SurveyStatus } from '@/generated/prisma/enums';
import { allWebsiteLanguages } from '@/lib/i18n/utils';
import z from 'zod';
import type { SurveyJsonValue } from './survey.types';

const requiredTrimmedString = z.string().trim().min(1, 'This field is required.');
const optionalTrimmedString = z.preprocess((value) => {
	if (typeof value !== 'string') {
		return value;
	}
	const trimmedValue = value.trim();

	return trimmedValue === '' ? undefined : trimmedValue;
}, z.string().trim().min(1, 'This field is required.').optional());

const surveyLanguageSchema = z
	.string()
	.trim()
	.refine((value) => allWebsiteLanguages.some((language) => language === value), 'Please select a valid language.');

const surveyDateSchema = z.preprocess(
	(value) => {
		if (value === '' || value === null || value === undefined) {
			return undefined;
		}

		return value;
	},
	z.coerce.date({ message: 'Please provide a valid due date.' }),
);

const surveyJsonValueSchema: z.ZodType<SurveyJsonValue> = z.lazy(() =>
	z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(surveyJsonValueSchema), z.record(surveyJsonValueSchema)]),
);

const surveyJsonObjectSchema = z.record(surveyJsonValueSchema);

export const surveyCreateSchema = z.object({
	name: requiredTrimmedString,
	recipientId: requiredTrimmedString,
	questionnaire: z.nativeEnum(SurveyQuestionnaire),
	language: surveyLanguageSchema,
	dueAt: surveyDateSchema,
	status: z.nativeEnum(SurveyStatus),
	accessEmail: z.string().trim().email('Please provide a valid access email.'),
	accessPw: requiredTrimmedString,
});

export const surveyUpdateSchema = surveyCreateSchema.extend({
	id: requiredTrimmedString,
	accessPw: optionalTrimmedString,
});

export const surveyIdSchema = requiredTrimmedString;

export const surveyPublicLookupSchema = z.object({
	surveyId: requiredTrimmedString,
	recipientId: requiredTrimmedString,
});

export const surveyResponseUpdateSchema = z.object({
	data: surveyJsonObjectSchema.optional(),
	status: z.nativeEnum(SurveyStatus).optional(),
	completedAt: z.coerce.date().nullable().optional(),
});

export const surveySaveActionSchema = z.object({
	surveyId: requiredTrimmedString,
	input: surveyResponseUpdateSchema,
});

export const surveyTableQuerySchema = z.object({
	page: z.number().int().positive(),
	pageSize: z.number().int().positive(),
	search: z.string(),
	sortBy: z.string().optional(),
	sortDirection: z.enum(['asc', 'desc']).optional(),
	programId: z.string().optional(),
});

export type SurveyCreateInput = z.infer<typeof surveyCreateSchema>;
export type SurveyUpdateInput = z.infer<typeof surveyUpdateSchema>;
