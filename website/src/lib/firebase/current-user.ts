import { services } from '@/lib/services/services';
import { UserSession } from '@/lib/services/user/user.types';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';

const findUserByAuthId = async (authUserId: string): Promise<UserSession | null> => {
	const result = await services.user.getCurrentUserSession(authUserId);
	return result.success ? result.data : null;
};

const loadCurrentUser = async (): Promise<UserSession | null> => {
	const cookie = await services.firebaseSession.readSessionCookie();
	if (!cookie) {
		return null;
	}
	const decodedTokenResult = await services.firebaseSession.verifySessionCookie(cookie);
	if (!decodedTokenResult.success) {
		return null;
	}

	const authUserId = decodedTokenResult.data.uid;
	return findUserByAuthId(authUserId);
};

const getCurrentUser = cache(loadCurrentUser);

export const getAuthenticatedUserOrRedirect = async (): Promise<UserSession> => {
	const user = await getCurrentUser();
	if (!user) {
		redirect('/login');
	}
	return user;
};

export const getAuthenticatedUserOrThrow = async (): Promise<UserSession> => {
	const user = await getCurrentUser();
	if (!user) {
		throw new Error('Not authenticated');
	}
	return user;
};

export const requireAdmin = async (user: UserSession): Promise<UserSession> => {
	if (user.role !== 'admin') {
		notFound();
	}
	return user;
};
