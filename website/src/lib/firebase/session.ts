import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const SESSION_COOKIE_NAME = 'session';
export const SESSION_MAX_AGE_DAYS = 7;
export const SESSION_EXPIRES_IN_MS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
export const IS_PROD = process.env.NODE_ENV === 'production';

export function setSessionCookie(res: NextResponse, value: string, maxAgeSeconds: number) {
	res.cookies.set({
		name: SESSION_COOKIE_NAME,
		value,
		httpOnly: true,
		secure: IS_PROD,
		sameSite: 'lax',
		path: '/',
		maxAge: maxAgeSeconds,
	});
	return res;
}

export function clearSessionCookie(res: NextResponse) {
	return setSessionCookie(res, '', 0);
}

export async function readSessionCookie(): Promise<string | null> {
	const store = await cookies();
	return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}
