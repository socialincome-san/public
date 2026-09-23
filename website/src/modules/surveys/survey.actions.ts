'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { getCurrentSurvey } from '@/lib/firebase/current-survey';
import { resultFail } from '@/lib/service-result';
import { getEditableRecipientOptions } from '@/modules/recipients/recipient.service';
import { revalidatePath } from 'next/cache';
import {
	surveyCreateSchema,
	surveyIdSchema,
	surveyPublicLookupSchema,
	surveySaveActionSchema,
	surveyUpdateSchema,
} from './survey.schemas';
import {
	createSurvey,
	generateSurveys,
	getSurvey,
	getSurveyByIdAndRecipient,
	getSurveyImpactFilterOptions,
	previewSurveyGeneration,
	saveSurveyChanges,
	updateSurvey,
} from './survey.service';

export const createSurveyAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const inputResult = surveyCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await createSurvey(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/management/surveys');

	return result;
};

export const getSurveyAction = async (surveyId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const surveyIdResult = surveyIdSchema.safeParse(surveyId);
	if (!surveyIdResult.success) {
		return resultFail('Invalid survey id');
	}

	return getSurvey(sessionResult.data.id, surveyIdResult.data);
};

export const updateSurveyAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const inputResult = surveyUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await updateSurvey(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/management/surveys');

	return result;
};

export const getSurveyRecipientOptionsAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getEditableRecipientOptions(sessionResult.data.id);
};

export const previewSurveyGenerationAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return previewSurveyGeneration(sessionResult.data.id);
};

export const generateSurveysAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const result = await generateSurveys(sessionResult.data.id);
	revalidatePath('/portal/management/surveys');

	return result;
};

export const getSurveyByIdAndRecipientAction = async (input: unknown) => {
	const inputResult = surveyPublicLookupSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid survey lookup');
	}
	const currentSurvey = await getCurrentSurvey();
	if (currentSurvey?.id !== inputResult.data.surveyId || currentSurvey.recipientId !== inputResult.data.recipientId) {
		return resultFail('Unauthorized');
	}

	return getSurveyByIdAndRecipient(inputResult.data.surveyId, inputResult.data.recipientId);
};

export const saveSurveyChangesAction = async (input: unknown) => {
	const inputResult = surveySaveActionSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}
	const currentSurvey = await getCurrentSurvey();
	if (currentSurvey?.id !== inputResult.data.surveyId) {
		return resultFail('Unauthorized');
	}

	return saveSurveyChanges(inputResult.data.surveyId, inputResult.data.input);
};

export const getSurveyImpactFilterOptionsAction = async () => getSurveyImpactFilterOptions();
