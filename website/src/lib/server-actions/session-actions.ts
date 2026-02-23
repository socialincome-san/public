'use server';

import { getCurrentSessions } from '../firebase/current-account';
import { FirebaseSessionService } from '../services/firebase/firebase-session.service';

const firebaseSessionService = new FirebaseSessionService();

export const createSessionAction = async (idToken: string) => {
	return firebaseSessionService.createSessionAndSetCookie(idToken);
};

export const logoutAction = async () => {
	return firebaseSessionService.clearSessionCookie();
};

export const getRedirectPathAfterLoginAction = async (): Promise<string> => {
	const sessions = await getCurrentSessions();
	const session = sessions[0];

	if (!session) {
		return '/';
	}

	if (session.type === 'user') {
		return '/portal';
	}

	if (session.type === 'contributor') {
		return '/dashboard/contributions';
	}

	if (session.type === 'local-partner') {
		return '/partner-space/recipients';
	}

	return '/';
};
