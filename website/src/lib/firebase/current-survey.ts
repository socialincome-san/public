import { services } from '@/lib/services/services';
import { getSurveyByAccessEmail } from '@/modules/surveys/survey.service';
import type { SurveyPayload } from '@/modules/surveys/survey.types';
import { cache } from 'react';

const loadCurrentSurvey = async (): Promise<SurveyPayload | null> => {
	const cookieResult = await services.firebaseSession.readSessionCookie();
	if (!cookieResult.success || !cookieResult.data) {
		return null;
	}
	const decodedTokenResult = await services.firebaseSession.verifySessionCookie(cookieResult.data);
	if (!decodedTokenResult.success) {
		return null;
	}

	const email = decodedTokenResult.data.email;
	if (!email) {
		return null;
	}
	const result = await getSurveyByAccessEmail(email);

	return result.success ? result.data : null;
};

export const getCurrentSurvey = cache(loadCurrentSurvey);
