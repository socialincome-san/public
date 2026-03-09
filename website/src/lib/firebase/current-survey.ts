import { services } from '@/lib/services/services';
import { cache } from 'react';
import { SurveyPayload } from '../services/survey/survey.types';

const loadCurrentSurvey = async (): Promise<SurveyPayload | null> => {
	const cookie = await services.firebaseSession.readSessionCookie();
	if (!cookie) {
		return null;
	}
	const decodedTokenResult = await services.firebaseSession.verifySessionCookie(cookie);
	if (!decodedTokenResult.success) {
		return null;
	}

	const email = decodedTokenResult.data.email;
	if (!email) {
		return null;
	}
	const result = await services.read.survey.getByAccessEmail(email);
	return result.success ? result.data : null;
};

export const getCurrentSurvey = cache(loadCurrentSurvey);
