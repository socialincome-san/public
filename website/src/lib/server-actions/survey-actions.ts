'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import type { SurveyCreateInput, SurveyUpdateInput } from '@/lib/services/survey/survey.types';
import { revalidatePath } from 'next/cache';
import { getCurrentSurvey } from '../firebase/current-survey';

export const createSurveyAction = async (input: SurveyCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();

	const result = await services.survey.create(user.id, input);

	revalidatePath('/portal/management/surveys');
	return result;
};

export const getSurveyAction = async (surveyId: string) => {
	const user = await getAuthenticatedUserOrThrow();

	const result = await services.survey.get(user.id, surveyId);

	return result;
};

export const updateSurveyAction = async (surveyId: string, input: SurveyUpdateInput) => {
	const user = await getAuthenticatedUserOrThrow();

	const result = await services.survey.update(user.id, surveyId, input);

	revalidatePath('/portal/management/surveys');
	return result;
};

export const getSurveyRecipientOptionsAction = async () => {
	const user = await getAuthenticatedUserOrThrow();

	return services.recipient.getEditableRecipientOptions(user.id);
};

export const previewSurveyGenerationAction = async () => {
	const user = await getAuthenticatedUserOrThrow();

	return services.survey.previewSurveyGeneration(user.id);
};

export const generateSurveysAction = async () => {
	const user = await getAuthenticatedUserOrThrow();

	const result = await services.survey.generateSurveys(user.id);

	revalidatePath('/portal/management/surveys');
	return result;
};

export const getByIdAndRecipient = async (surveyId: string, recipientId: string) => {
	const survey = await getCurrentSurvey();
	if (!survey || survey.id !== surveyId || survey.recipientId !== recipientId) {
		const reason = !survey ? 'no survey' : survey.id !== surveyId ? 'survey ID mismatch' : 'recipient ID mismatch';
		throw new Error(`Unauthorized: ${reason}`);
	}
	const result = await services.survey.getByIdAndRecipient(surveyId, recipientId);
	if (!result.success) {
		throw new Error(`Survey cannot be loaded: ${result.error}`);
	}
	return result.data;
};

export const saveChanges = async (surveyId: string, input: SurveyUpdateInput) => {
	const survey = await getCurrentSurvey();
	if (!survey || survey.id !== surveyId) {
		throw new Error('Unauthorized');
	}

	const result = await services.survey.saveChanges(surveyId, input);
	if (!result.success) {
		throw new Error('Could not save survey changes');
	}
	return result.data;
};
