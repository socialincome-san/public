import type { SurveyCreateInput, SurveyPayload, SurveyUpdateInput } from '@/lib/services/survey/survey.types';
import { SurveyFormSchema } from './survey-form';

export const buildCreateSurveyInput = (schema: SurveyFormSchema): SurveyCreateInput => {
	return {
		name: schema.fields.name.value,
		recipient: { connect: { id: schema.fields.recipientId.value } },
		questionnaire: schema.fields.questionnaire.value,
		language: schema.fields.language.value,
		dueAt: new Date(schema.fields.dueAt.value),
		status: schema.fields.status.value,
		data: {},
		accessEmail: schema.fields.accessEmail.value,
		accessPw: schema.fields.accessPw.value,
	};
}

export const buildUpdateSurveyInput = (schema: SurveyFormSchema, existing: SurveyPayload): SurveyUpdateInput => {
	const data: SurveyUpdateInput = {
		name: schema.fields.name.value,
		questionnaire: schema.fields.questionnaire.value,
		language: schema.fields.language.value,
		dueAt: new Date(schema.fields.dueAt.value),
		status: schema.fields.status.value,
		data: {},
		accessEmail: schema.fields.accessEmail.value,
		accessPw: schema.fields.accessPw.value,
	};

	if (schema.fields.recipientId.value !== existing.recipientId) {
		data.recipient = { connect: { id: schema.fields.recipientId.value } };
	}

	return data;
}
