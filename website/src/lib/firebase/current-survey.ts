import { getSurveyByAccessEmail } from '@/modules/surveys/survey.service';
import type { SurveyPayload } from '@/modules/surveys/survey.types';
import { cache } from 'react';
import { getCurrentAuthToken } from './session-cookie';

const loadCurrentSurvey = async (): Promise<SurveyPayload | null> => {
	const decodedTokenResult = await getCurrentAuthToken();
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
