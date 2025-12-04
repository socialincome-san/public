import { FirebaseService } from '@/lib/services/firebase/firebase.service';
import { cache } from 'react';
import { SurveyService } from '../services/survey/survey.service';
import { SurveyPayload } from '../services/survey/survey.types';

const firebaseService = new FirebaseService();

async function findSurveyByEmail(email: string): Promise<SurveyPayload | null> {
	console.log('findSurveyByEmail', email);
	const service = new SurveyService();
	const result = await service.getByAccessEmail(email);
	console.log('findSurveyByEmail result', result);
	return result.success ? result.data : null;
}

async function loadCurrentSurvey(): Promise<SurveyPayload | null> {
	const cookie = await firebaseService.readSessionCookie();
	if (!cookie) {
		return null;
	}
	const decodedTokenResult = await firebaseService.verifySessionCookie(cookie);
	if (!decodedTokenResult.success) {
		return null;
	}
	console.log('decodedTokenResult', decodedTokenResult);

	const email = decodedTokenResult.data.email;
	if (!email) {
		return null;
	}
	return findSurveyByEmail(email);
}

export const getCurrentSurvey = cache(loadCurrentSurvey);
