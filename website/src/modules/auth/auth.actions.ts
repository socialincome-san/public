'use server';

import { resultFail, resultOk, type Result } from '@/lib/result';
import { SESSION_COOKIE_NAME } from '@/modules/auth/auth.types';
import { getCurrentSessions, getCurrentUser, getSessionByType } from '@/modules/auth/session.service';
import type { UserSession } from '@/modules/users/user.types';
import { cookies } from 'next/headers';
import { sessionIdTokenSchema } from './auth.schemas';
import { createSessionCookie } from './auth.service';

export const createSessionAction = async (input: unknown): Promise<Result<boolean>> => {
	const inputResult = sessionIdTokenSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('missing-id-token');
	}

	const sessionCookieResult = await createSessionCookie(inputResult.data);
	if (!sessionCookieResult.success) {
		return resultFail(sessionCookieResult.error);
	}

	try {
		(await cookies()).set({
			name: SESSION_COOKIE_NAME,
			value: sessionCookieResult.data.value,
			httpOnly: true,
			secure: IS_PRODUCTION,
			sameSite: 'lax',
			path: '/',
			maxAge: sessionCookieResult.data.maxAge,
		});

		return resultOk(true);
	} catch (error) {
		console.error('Could not set session cookie', { error });

		return resultFail('Could not create session cookie');
	}
};

export const logoutAction = async (): Promise<Result<boolean>> => {
	try {
		(await cookies()).set({
			name: SESSION_COOKIE_NAME,
			value: '',
			httpOnly: true,
			secure: IS_PRODUCTION,
			sameSite: 'lax',
			path: '/',
			maxAge: 0,
		});

		return resultOk(true);
	} catch (error) {
		console.error('Could not clear session cookie', { error });

		return resultFail('logout-failed');
	}
};

export const getIsAuthenticatedUserAction = async (): Promise<Result<boolean>> => {
	const sessionResult = await getSessionByType('user');

	return resultOk(sessionResult.success);
};

export const getCurrentUserAction = async (): Promise<Result<UserSession | null>> => getCurrentUser();

export const getRedirectPathAfterLoginAction = async (): Promise<Result<string>> => {
	const sessionsResult = await getCurrentSessions();
	const session = sessionsResult.success ? sessionsResult.data[0] : undefined;

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

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
