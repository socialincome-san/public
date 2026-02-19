import { FirebaseSessionService } from '@/lib/services/firebase/firebase-session.service';
import { UserService } from '@/lib/services/user/user.service';
import { UserSession } from '@/lib/services/user/user.types';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';

const firebaseSessionService = new FirebaseSessionService();

const findUserByAuthId = async (authUserId: string): Promise<UserSession | null> => {
	const service = new UserService();
	const result = await service.getCurrentUserSession(authUserId);
	return result.success ? result.data : null;
}

const loadCurrentUser = async (): Promise<UserSession | null> => {
	const cookie = await firebaseSessionService.readSessionCookie();
	if (!cookie) {
		return null;
	}
	const decodedTokenResult = await firebaseSessionService.verifySessionCookie(cookie);
	if (!decodedTokenResult.success) {
		return null;
	}

	const authUserId = decodedTokenResult.data.uid;
	return findUserByAuthId(authUserId);
}

const getCurrentUser = cache(loadCurrentUser);

export const getAuthenticatedUserOrRedirect = async (): Promise<UserSession> => {
	const user = await getCurrentUser();
	if (!user) {
		redirect('/login');
	}
	return user;
}

export const getAuthenticatedUserOrThrow = async (): Promise<UserSession> => {
	const user = await getCurrentUser();
	if (!user) {
		throw new Error('Not authenticated');
	}
	return user;
}

export const requireAdmin = async (user: UserSession): Promise<UserSession> => {
	if (user.role !== 'admin') {
		notFound();
	}
	return user;
}
