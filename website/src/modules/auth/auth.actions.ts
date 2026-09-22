'use server';

import { getCurrentSessions, getSessionByType } from '@/lib/firebase/current-account';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { sessionIdTokenSchema } from './auth.schemas';
import { clearSessionCookie, createSessionAndSetCookie } from './auth.service';

export const createSessionAction = async (input: unknown) => {
	const inputResult = sessionIdTokenSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'missing-id-token');
	}

	return createSessionAndSetCookie(inputResult.data);
};

export const logoutAction = async () => clearSessionCookie();

export const getIsAuthenticatedUserAction = async (): Promise<boolean> => {
	const sessionResult = await getSessionByType('user');

	return sessionResult.success;
};

export const getRedirectPathAfterLoginAction = async (): Promise<ServiceResult<string>> => {
	const sessions = await getCurrentSessions();
	const session = sessions[0];

	if (!session) {
		return resultOk('/');
	}
	if (session.type === 'user') {
		return resultOk('/portal');
	}
	if (session.type === 'contributor') {
		return resultOk('/dashboard/subscriptions');
	}
	if (session.type === 'local-partner') {
		return resultOk('/partner-space/recipients');
	}

	return resultOk('/');
};
