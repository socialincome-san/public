// lib/firebase/current-user.ts
import { authAdmin } from '@/lib/firebase/firebase-admin';
import type { User as PrismaUser } from '@prisma/client';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { readSessionCookie } from './session';

async function verifySessionToken(cookie: string) {
	return authAdmin.auth.verifySessionCookie(cookie, true);
}

async function findUserByAuthId(authUserId: string): Promise<PrismaUser | null> {
	const userService = new UserService();
	const result = await userService.getCurrentUserByAuthId(authUserId);
	return result.success ? (result.data as PrismaUser) : null;
}

async function loadCurrentUser(): Promise<PrismaUser | null> {
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

export async function getAuthenticatedUserOrRedirect(): Promise<PrismaUser> {
	const user = await getCurrentUser();
	if (!user) redirect('/login');
	return user;
}

export async function requireGlobalAnalystOrGlobalAdmin(user: PrismaUser): Promise<PrismaUser> {
	if (user.role !== 'globalAnalyst' && user.role !== 'globalAdmin') {
		notFound();
	}
	return user;
}
