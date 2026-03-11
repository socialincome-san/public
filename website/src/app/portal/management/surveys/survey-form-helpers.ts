import type { SurveyFormCreateInput, SurveyFormUpdateInput } from '@/lib/services/survey/survey-form-input';
import type { SurveyPayload } from '@/lib/services/survey/survey.types';
import { SurveyFormSchema } from './survey-form';

export const buildCreateSurveyInput = (schema: SurveyFormSchema): SurveyFormCreateInput => {
	return {
		name: schema.fields.name.value,
		recipientId: schema.fields.recipientId.value,
		questionnaire: schema.fields.questionnaire.value,
		language: schema.fields.language.value,
		dueAt: new Date(
			typeof dueAtValue === 'string' || typeof dueAtValue === 'number' || dueAtValue instanceof Date
				? dueAtValue
				: new Date(),
		),
		status: schema.fields.status.value,
		accessEmail: schema.fields.accessEmail.value,
		accessPw: `${schema.fields.accessPw.value ?? ''}`.trim(),
	};
};

export const buildUpdateSurveyInput = (schema: SurveyFormSchema, existing: SurveyPayload): SurveyFormUpdateInput => {
	const nextAccessPassword = `${schema.fields.accessPw.value ?? ''}`.trim();

	return {
		id: existing.id,
		name: schema.fields.name.value,
		recipientId: schema.fields.recipientId.value,
		questionnaire: schema.fields.questionnaire.value,
		language: schema.fields.language.value,
		dueAt: new Date(
			typeof dueAtValue === 'string' || typeof dueAtValue === 'number' || dueAtValue instanceof Date
				? dueAtValue
				: new Date(),
		),
		status: schema.fields.status.value,
		accessEmail: schema.fields.accessEmail.value,
		accessPw: nextAccessPassword === '' ? undefined : nextAccessPassword,
	};
};
