'use server';

import { getCurrentSessions } from '../firebase/current-account';
import { ROUTES } from '../constants/routes';
import { ServiceResult } from '../services/core/base.types';
import { resultOk } from '../services/core/service-result';
import { services } from '../services/services';

export const createSessionAction = async (idToken: string) => {
	return services.firebaseSession.createSessionAndSetCookie(idToken);
};

export const logoutAction = async () => {
	return services.firebaseSession.clearSessionCookie();
};

export const getRedirectPathAfterLoginAction = async (): Promise<ServiceResult<string>> => {
	const sessions = await getCurrentSessions();
	const session = sessions[0];

	if (!session) {
		return resultOk('/');
	}

	if (session.type === 'user') {
		return resultOk(ROUTES.portal);
	}

	if (session.type === 'contributor') {
		return resultOk(ROUTES.dashboardContributions);
	}

	if (session.type === 'local-partner') {
		return resultOk(ROUTES.partnerSpaceRecipients);
	}

	return resultOk('/');
};
