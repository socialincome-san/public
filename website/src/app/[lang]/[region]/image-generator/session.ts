import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'image-generator-session';
const SESSION_SECRET = process.env.SESSION_SECRET;

function getSessionSecret() {
	if (!SESSION_SECRET) {
		throw new Error('Missing SESSION_SECRET');
	}
	return SESSION_SECRET;
}
function signSession(value: string): string {
	return createHmac('sha256', getSessionSecret()).update(value).digest('hex');
}
function createSessionValue(): string {
	const authenticated = 'authenticated';
	const signature = signSession(authenticated);
	return `${authenticated}.${signature}`;
}
export async function setSessionCookie(): Promise<void> {
	const store = await cookies();
	const value = createSessionValue();
	store.set({
		name: COOKIE_NAME,
		value: value,
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
	});
}
async function getSessionCookie(): Promise<string | null> {
	const store = await cookies();
	const value = store.get(COOKIE_NAME)?.value;
	return value ?? null;
}
export async function isSessionValid(): Promise<boolean> {
	const cookie = await getSessionCookie();
	if (cookie == null) {
		return false;
	}
	const parts = cookie.split('.');
	if (parts.length !== 2) {
		return false;
	}
	const value = parts[0];
	const signature = parts[1];

	if (value !== 'authenticated') {
		return false;
	}
	const expectedSignature = signSession(value);
	const signatureBuffer = Buffer.from(signature, 'hex');
	const expectedSignatureBuffer = Buffer.from(expectedSignature, 'hex');
	if (signatureBuffer.length !== expectedSignatureBuffer.length) {
		return false;
	}
	if (!timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
		return false;
	}
	return true;
}
export async function clearSessionCookie(): Promise<void> {
	const store = await cookies();
	store.set({
		name: COOKIE_NAME,
		value: '',
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		maxAge: 0,
	});
}
