'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import { SurveyService } from '@/lib/services/survey/survey.service';
import type { SurveyCreateInput, SurveyUpdateInput } from '@/lib/services/survey/survey.types';
import { revalidatePath } from 'next/cache';

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
	const service = new SurveyService();

	const result = await service.getByIdAndRecipient(surveyId, recipientId);
	return result;
}
