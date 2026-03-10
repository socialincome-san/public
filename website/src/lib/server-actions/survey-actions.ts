'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { ServiceResult } from '@/lib/services/core/base.types';
import { resultFail } from '@/lib/services/core/service-result';
import { services } from '@/lib/services/services';
import type {
	SurveyCreateInput,
	SurveyPayload,
	SurveyUpdateInput,
	SurveyWithRecipient,
} from '@/lib/services/survey/survey.types';
import { revalidatePath } from 'next/cache';
import { getCurrentSurvey } from '../firebase/current-survey';

export const createSurveyAction = async (input: SurveyCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.survey.create(sessionResult.data.id, input);
	revalidatePath('/portal/management/surveys');
	return result;
};

export const getSurveyAction = async (surveyId: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.read.survey.get(sessionResult.data.id, surveyId);
};

export const updateSurveyAction = async (surveyId: string, input: SurveyUpdateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.survey.update(sessionResult.data.id, surveyId, input);
	revalidatePath('/portal/management/surveys');
	return result;
};

export const getSurveyRecipientOptionsAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.read.recipient.getEditableRecipientOptions(sessionResult.data.id);
};

export const previewSurveyGenerationAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.read.survey.previewSurveyGeneration(sessionResult.data.id);
};

export const generateSurveysAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.survey.generateSurveys(sessionResult.data.id);
	revalidatePath('/portal/management/surveys');
	return result;
};

export const getByIdAndRecipient = async (
	surveyId: string,
	recipientId: string,
): Promise<ServiceResult<SurveyWithRecipient>> => {
	const survey = await getCurrentSurvey();
	if (!survey || survey.id !== surveyId || survey.recipientId !== recipientId) {
		return resultFail('Unauthorized');
	}
	return services.read.survey.getByIdAndRecipient(surveyId, recipientId);
};

export const saveChanges = async (
	surveyId: string,
	input: SurveyUpdateInput,
): Promise<ServiceResult<SurveyPayload>> => {
	const survey = await getCurrentSurvey();
	if (!survey || survey.id !== surveyId) {
		return resultFail('Unauthorized');
	}
	return services.write.survey.saveChanges(surveyId, input);
};
