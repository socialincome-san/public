import { FirebaseService } from '@/lib/services/firebase/firebase.service';
import { UserService } from '@/lib/services/user/user.service';
import { UserSession } from '@/lib/services/user/user.types';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { readSessionCookie } from './session';

async function findUserByAuthId(authUserId: string): Promise<UserSession | null> {
	const service = new UserService();
	const result = await service.getCurrentUserSession(authUserId);
	return result.success ? result.data : null;
}

async function loadCurrentUser(): Promise<UserSession | null> {
	const cookie = await readSessionCookie();
	if (!cookie) {
		return null;
	}
	const decodedTokenResult = await new FirebaseService().verifySessionCookie(cookie);
	if (!decodedTokenResult.success) {
		return null;
	}

	const authUserId = decodedTokenResult.data.uid;
	return findUserByAuthId(authUserId);
}

const getCurrentUser = cache(loadCurrentUser);

export async function getAuthenticatedUserOrRedirect(): Promise<UserSession> {
	const user = await getCurrentUser();
	if (!user) {
		redirect('/login');
	}
	return user;
}

export async function getAuthenticatedUserOrThrow(): Promise<UserSession> {
	const user = await getCurrentUser();
	if (!user) {
		throw new Error('Not authenticated');
	}
	return user;
}

export async function requireAdmin(user: UserSession): Promise<UserSession> {
	if (user.role !== 'admin') {
		notFound();
	}
	return user;
}
