/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { SurveyCreateInput, SurveyUpdateInput } from '@/modules/surveys/survey.schemas';
import type { SurveyPayload } from '@/modules/surveys/survey.types';
import { SurveyFormSchema } from './survey-form';

const toDateOrNow = (value: unknown): Date => {
	return new Date(typeof value === 'string' || typeof value === 'number' || value instanceof Date ? value : new Date());
};

export const buildCreateSurveyInput = (schema: SurveyFormSchema): SurveyCreateInput => {
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

export const buildUpdateSurveyInput = (schema: SurveyFormSchema, existing: SurveyPayload): SurveyUpdateInput => {
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
