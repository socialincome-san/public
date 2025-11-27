'use server';

import { FirebaseService } from '../services/firebase/firebase.service';

const firebaseService = new FirebaseService();

export async function createSessionAction(idToken: string) {
	return firebaseService.createSessionAndSetCookie(idToken);
}

export async function logoutAction() {
	return firebaseService.clearSessionCookie();
}
