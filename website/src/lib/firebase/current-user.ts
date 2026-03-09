import { getServices } from '@/lib/services/services';
import { UserSession } from '@/lib/services/user/user.types';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';

const loadCurrentUser = async (): Promise<UserSession | null> => {
	const cookie = await getServices().firebaseSession.readSessionCookie();
	if (!cookie) {
		return null;
	}
	const decodedTokenResult = await getServices().firebaseSession.verifySessionCookie(cookie);
	if (!decodedTokenResult.success) {
		return null;
	}

	const authUserId = decodedTokenResult.data.uid;
	const result = await getServices().userRead.getCurrentUserSession(authUserId);
	return result.success ? result.data : null;
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
