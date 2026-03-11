import { SurveyQuestionnaire, SurveyStatus } from '@/generated/prisma/enums';
import { allWebsiteLanguages } from '@/lib/i18n/utils';
import z from 'zod';

const requiredTrimmedString = z.string().trim().min(1, 'This field is required.');

const surveyLanguageSchema = z.enum(allWebsiteLanguages as [string, ...string[]], {
	errorMap: () => ({ message: 'Please select a valid language.' }),
});

const surveyDateSchema = z.preprocess((value) => {
	if (value === '' || value == null) {
		return value;
	}
	return value;
}, z.coerce.date());

export const surveyCreateInputSchema = z.object({
	name: requiredTrimmedString,
	recipientId: requiredTrimmedString,
	questionnaire: z.nativeEnum(SurveyQuestionnaire),
	language: surveyLanguageSchema,
	dueAt: surveyDateSchema,
	status: z.nativeEnum(SurveyStatus),
	accessEmail: z.string().trim().email('Please provide a valid access email.'),
	accessPw: requiredTrimmedString,
});

export const surveyUpdateInputSchema = surveyCreateInputSchema.extend({
	id: requiredTrimmedString,
});

export type SurveyFormCreateInput = z.infer<typeof surveyCreateInputSchema>;
export type SurveyFormUpdateInput = z.infer<typeof surveyUpdateInputSchema>;
