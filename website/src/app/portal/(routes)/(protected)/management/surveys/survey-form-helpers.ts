import type {
	SurveyCreateInput,
	SurveyPayload,
	SurveyUpdateInput,
} from '@socialincome/shared/src/database/services/survey/survey.types';
import { SurveyFormSchema } from './survey-form';

export function buildCreateSurveyInput(schema: SurveyFormSchema): SurveyCreateInput {
	return {
		recipient: { connect: { id: schema.fields.recipientId.value } },
		questionnaire: schema.fields.questionnaire.value,
		language: schema.fields.language.value,
		dueAt: new Date(schema.fields.dueAt.value),
		status: schema.fields.status.value,
		data: {},
		accessEmail: schema.fields.accessEmail.value,
		accessPw: schema.fields.accessPw.value,
		accessToken: schema.fields.accessToken.value,
	};
}

export function buildUpdateSurveyInput(schema: SurveyFormSchema, existing: SurveyPayload): SurveyUpdateInput {
	const data: SurveyUpdateInput = {
		questionnaire: schema.fields.questionnaire.value,
		language: schema.fields.language.value,
		dueAt: new Date(schema.fields.dueAt.value),
		status: schema.fields.status.value,
		data: {},
		accessEmail: schema.fields.accessEmail.value,
		accessPw: schema.fields.accessPw.value,
		accessToken: schema.fields.accessToken.value,
	};

	if (schema.fields.recipientId.value !== existing.recipientId) {
		data.recipient = { connect: { id: schema.fields.recipientId.value } };
	}

	return data;
}
