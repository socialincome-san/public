'use server';

import { FirebaseSessionService } from '../services/firebase/firebase-session.service';

const firebaseSessionService = new FirebaseSessionService();

export async function createSessionAction(idToken: string) {
	return firebaseSessionService.createSessionAndSetCookie(idToken);
}

export async function logoutAction() {
	return firebaseSessionService.clearSessionCookie();
}
