import type { SurveyPayload } from '@/lib/services/survey/survey.types';
import type { SurveyFormCreateInput, SurveyFormUpdateInput } from '@/lib/services/survey/survey-form-input';
import { SurveyFormSchema } from './survey-form';

export const buildCreateSurveyInput = (schema: SurveyFormSchema): SurveyFormCreateInput => {
	return {
		name: schema.fields.name.value,
		recipientId: schema.fields.recipientId.value,
		questionnaire: schema.fields.questionnaire.value,
		language: schema.fields.language.value,
		dueAt: new Date(schema.fields.dueAt.value),
		status: schema.fields.status.value,
		accessEmail: schema.fields.accessEmail.value,
		accessPw: schema.fields.accessPw.value,
	};
};

export const buildUpdateSurveyInput = (schema: SurveyFormSchema, existing: SurveyPayload): SurveyFormUpdateInput => {
	return {
		id: existing.id,
		name: schema.fields.name.value,
		recipientId: schema.fields.recipientId.value,
		questionnaire: schema.fields.questionnaire.value,
		language: schema.fields.language.value,
		dueAt: new Date(schema.fields.dueAt.value),
		status: schema.fields.status.value,
		accessEmail: schema.fields.accessEmail.value,
		accessPw: schema.fields.accessPw.value,
	};
};
