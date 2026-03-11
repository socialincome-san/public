import { ROUTES } from '@/lib/constants/routes';
import { services } from '@/lib/services/services';
import { UserSession } from '@/lib/services/user/user.types';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';

const loadCurrentUser = async (): Promise<UserSession | null> => {
	const cookieResult = await services.firebaseSession.readSessionCookie();
	if (!cookieResult.success || !cookieResult.data) {
		return null;
	}
	const decodedTokenResult = await services.firebaseSession.verifySessionCookie(cookieResult.data);
	if (!decodedTokenResult.success) {
		return null;
	}

	const authUserId = decodedTokenResult.data.uid;
	const result = await services.read.user.getCurrentUserSession(authUserId);
	return result.success ? result.data : null;
};

const getCurrentUser = cache(loadCurrentUser);

export const getAuthenticatedUserOrRedirect = async (): Promise<UserSession> => {
	const user = await getCurrentUser();
	if (!user) {
		redirect(ROUTES.login);
	}
	return user;
};

export const requireAdmin = async (user: UserSession): Promise<UserSession> => {
	if (user.role !== 'admin') {
		notFound();
	}
	return user;
};
