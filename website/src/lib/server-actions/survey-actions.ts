'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import { SurveyService } from '@/lib/services/survey/survey.service';
import type { SurveyCreateInput, SurveyUpdateInput } from '@/lib/services/survey/survey.types';
import { logger } from '@/utils/logger';
import { revalidatePath } from 'next/cache';
import { getCurrentSurvey } from '../firebase/current-survey';

export async function createSurveyAction(input: SurveyCreateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new SurveyService();

	const result = await service.create(user.id, input);

	revalidatePath('/portal/management/surveys');
	return result;
}

export async function getSurveyAction(surveyId: string) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new SurveyService();

	const result = await service.get(user.id, surveyId);

	return result;
}

export async function updateSurveyAction(surveyId: string, input: SurveyUpdateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new SurveyService();

	const result = await service.update(user.id, surveyId, input);

	revalidatePath('/portal/management/surveys');
	return result;
}

export async function getSurveyRecipientOptionsAction() {
	const user = await getAuthenticatedUserOrThrow();
	const recipientService = new RecipientService();

	return recipientService.getEditableRecipientOptions(user.id);
}

export async function previewSurveyGenerationAction() {
	const user = await getAuthenticatedUserOrThrow();
	const service = new SurveyService();

	return service.previewSurveyGeneration(user.id);
}

export async function generateSurveysAction() {
	const user = await getAuthenticatedUserOrThrow();
	const service = new SurveyService();

	const result = await service.generateSurveys(user.id);

	revalidatePath('/portal/management/surveys');
	return result;
}

export async function getByIdAndRecipient(surveyId: string, recipientId: string) {
	logger.info('getByIdAndRecipient called');
	const survey = await getCurrentSurvey();
	logger.info(`suvrey ${survey}`);
	logger.info(`surveyId ${surveyId}`);
	logger.info(`recipientId ${recipientId}`);
	if (!survey || survey.id !== surveyId || survey.recipientId !== recipientId) {
		const reason = !survey ? 'no survey' : survey.id !== surveyId ? 'survey ID mismatch' : 'recipient ID mismatch';
		throw new Error(`Unauthorized: ${reason}`);
	}
	const service = new SurveyService();
	logger.info('loading survey from service');
	const result = await service.getByIdAndRecipient(surveyId, recipientId);
	if (!result.success) {
		throw new Error(`Survey cannot be loaded: ${result.error}`);
	}
	return result.data;
}

export async function saveChanges(surveyId: string, input: SurveyUpdateInput) {
	const survey = await getCurrentSurvey();
	if (!survey || survey.id !== surveyId) {
		throw new Error('Unauthorized');
	}
	const service = new SurveyService();

	const result = await service.saveChanges(surveyId, input);
	if (!result.success) {
		throw new Error('Could not save survey changes');
	}
	return result.data;
}
