'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { getCurrentSurvey } from '@/lib/firebase/current-survey';
import { resultFail, type Result } from '@/lib/result';
import { getEditableRecipientOptions } from '@/modules/recipients/recipient.service';
import type { RecipientOption } from '@/modules/recipients/recipient.types';
import type {
	SurveyGenerationPreviewResult,
	SurveyGenerationResult,
	SurveyImpactFilterOptions,
	SurveyPayload,
	SurveyWithRecipient,
} from '@/modules/surveys/survey.types';
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

export const createSurveyAction = async (input: unknown): Promise<Result<SurveyPayload>> => {
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

export const getSurveyAction = async (surveyId: unknown): Promise<Result<SurveyPayload>> => {
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

export const updateSurveyAction = async (input: unknown): Promise<Result<SurveyPayload>> => {
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

export const getSurveyRecipientOptionsAction = async (): Promise<Result<RecipientOption[]>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getEditableRecipientOptions(sessionResult.data.id);
};

export const previewSurveyGenerationAction = async (): Promise<Result<SurveyGenerationPreviewResult>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return previewSurveyGeneration(sessionResult.data.id);
};

export const generateSurveysAction = async (): Promise<Result<SurveyGenerationResult>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const result = await generateSurveys(sessionResult.data.id);
	revalidatePath('/portal/management/surveys');

	return result;
};

export const getSurveyByIdAndRecipientAction = async (input: unknown): Promise<Result<SurveyWithRecipient>> => {
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

export const saveSurveyChangesAction = async (input: unknown): Promise<Result<SurveyPayload>> => {
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

export const getSurveyImpactFilterOptionsAction = async (): Promise<Result<SurveyImpactFilterOptions>> =>
	getSurveyImpactFilterOptions();
