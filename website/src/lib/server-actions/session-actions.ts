'use server';

import { FirebaseSessionService } from '../services/firebase/firebase-session.service';

const firebaseSessionService = new FirebaseSessionService();

export const createSessionAction = async (idToken: string) => {
  return firebaseSessionService.createSessionAndSetCookie(idToken);
};

export const logoutAction = async () => {
  return firebaseSessionService.clearSessionCookie();
};
