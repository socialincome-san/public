/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { SurveyFormCreateInput, SurveyFormUpdateInput } from '@/lib/services/survey/survey-form-input';
import type { SurveyPayload } from '@/lib/services/survey/survey.types';
import { SurveyFormSchema } from './survey-form';

const toDateOrNow = (value: unknown): Date => {
	return new Date(typeof value === 'string' || typeof value === 'number' || value instanceof Date ? value : new Date());
};

export const buildCreateSurveyInput = (schema: SurveyFormSchema): SurveyFormCreateInput => {
	const dueAtValue = schema.fields.dueAt.value;

	return {
		name: schema.fields.name.value,
		recipientId: schema.fields.recipientId.value,
		questionnaire: schema.fields.questionnaire.value,
		language: schema.fields.language.value,
		dueAt: toDateOrNow(dueAtValue),
		status: schema.fields.status.value,
		accessEmail: schema.fields.accessEmail.value,
		accessPw: `${schema.fields.accessPw.value ?? ''}`.trim(),
	};
};

export const buildUpdateSurveyInput = (schema: SurveyFormSchema, existing: SurveyPayload): SurveyFormUpdateInput => {
	const dueAtValue = schema.fields.dueAt.value;
	const nextAccessPassword = `${schema.fields.accessPw.value ?? ''}`.trim();

	return {
		id: existing.id,
		name: schema.fields.name.value,
		recipientId: schema.fields.recipientId.value,
		questionnaire: schema.fields.questionnaire.value,
		language: schema.fields.language.value,
		dueAt: toDateOrNow(dueAtValue),
		status: schema.fields.status.value,
		accessEmail: schema.fields.accessEmail.value,
		accessPw: nextAccessPassword === '' ? undefined : nextAccessPassword,
	};
};
