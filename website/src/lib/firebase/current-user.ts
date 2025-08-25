import { authAdmin } from '@/lib/firebase/firebase-admin';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { UserInformation } from '@socialincome/shared/src/database/services/user/user.types';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { readSessionCookie } from './session';

async function verifySessionToken(cookie: string) {
	return authAdmin.auth.verifySessionCookie(cookie, true);
}

async function findUserByAuthId(uid: string): Promise<UserInformation | null> {
	const svc = new UserService();
	const res = await svc.getCurrentUserByAuthId(uid);
	return res.success ? (res.data as UserInformation) : null;
}

async function loadCurrentUser(): Promise<UserInformation | null> {
	const cookie = await readSessionCookie();
	if (!cookie) return null;
	try {
		const decoded = await verifySessionToken(cookie);
		return await findUserByAuthId(decoded.uid);
	} catch {
		return null;
	}
}

const getCurrentUser = cache(loadCurrentUser);

export async function getAuthenticatedUserOrRedirect(): Promise<UserInformation> {
	const user = await getCurrentUser();
	if (!user) redirect('/login');
	return user;
}
