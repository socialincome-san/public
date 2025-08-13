import { authAdmin } from '@/lib/firebase/firebase-admin';
import type { User as PrismaUser } from '@prisma/client';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { readSessionCookie } from './session';

async function verifySessionToken(cookie: string) {
	return authAdmin.auth.verifySessionCookie(cookie, true);
}

async function findUserByAuthId(uid: string): Promise<PrismaUser | null> {
	const svc = new UserService();
	const res = await svc.getCurrentUserByAuthId(uid);
	return res.success ? (res.data as PrismaUser) : null;
}

async function loadCurrentUser(): Promise<PrismaUser | null> {
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

export async function getAuthenticatedUserOrRedirect(): Promise<PrismaUser> {
	const user = await getCurrentUser();
	if (!user) redirect('/login');
	return user;
}
