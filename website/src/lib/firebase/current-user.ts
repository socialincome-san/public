import { authAdmin } from '@/lib/firebase/firebase-admin';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { UserInformation } from '@socialincome/shared/src/database/services/user/user.types';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { readSessionCookie } from './session';

async function verifySessionToken(cookie: string) {
	return authAdmin.auth.verifySessionCookie(cookie, true);
}

async function findUserByAuthId(authUserId: string): Promise<UserInformation | null> {
	const userService = new UserService();
	const result = await userService.getCurrentUserByAuthId(authUserId);
	return result.success ? (result.data as UserInformation) : null;
}

async function loadCurrentUser(): Promise<UserInformation | null> {
	const cookie = await readSessionCookie();
	if (!cookie) return null;
	try {
		const decodedToken = await verifySessionToken(cookie);
		return await findUserByAuthId(decodedToken.uid);
	} catch {
		return null;
	}
}

const getCurrentUser = cache(loadCurrentUser);

export async function getAuthenticatedUserOrRedirect(): Promise<UserInformation> {
	const user = await getCurrentUser();
	if (!user) redirect('/portal/login');
	return user;
}

export async function requireGlobalAnalystOrGlobalAdmin(user: UserInformation): Promise<UserInformation> {
	if (user.role !== 'globalAnalyst' && user.role !== 'globalAdmin') {
		notFound();
	}
	return user;
}
