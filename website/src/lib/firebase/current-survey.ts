import { FirebaseSessionService } from '@/lib/services/firebase/firebase-session.service';
import { cache } from 'react';
import { SurveyService } from '../services/survey/survey.service';
import { SurveyPayload } from '../services/survey/survey.types';

const firebaseSessionService = new FirebaseSessionService();

const findSurveyByEmail = async (email: string): Promise<SurveyPayload | null> => {
  const service = new SurveyService();
  const result = await service.getByAccessEmail(email);

  return result.success ? result.data : null;
};

const loadCurrentSurvey = async (): Promise<SurveyPayload | null> => {
  const cookie = await firebaseSessionService.readSessionCookie();
  if (!cookie) {
    return null;
  }
  const decodedTokenResult = await firebaseSessionService.verifySessionCookie(cookie);
  if (!decodedTokenResult.success) {
    return null;
  }

  const email = decodedTokenResult.data.email;
  if (!email) {
    return null;
  }

  return findSurveyByEmail(email);
};

export const getCurrentSurvey = cache(loadCurrentSurvey);
