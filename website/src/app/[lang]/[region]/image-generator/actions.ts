'use server';

import { createHash, timingSafeEqual } from 'node:crypto';
import { setSessionCookie } from './session';

export async function login(prevState: string | null, formData: FormData): Promise<string | null> {
	const password = formData.get('password');

	const appPassword = process.env.APP_PASSWORD;
	if (!appPassword) {
		return 'App is not configured';
	}
	if (typeof password != 'string') {
		return 'Missing Password';
	}
	const passwordHash = hashText(password);
	const appPasswordHash = hashText(appPassword);
	if (!timingSafeEqual(passwordHash, appPasswordHash)) {
		return 'Wrong password';
	}
	await setSessionCookie();
	return null;
}
function hashText(text: string): Buffer {
	return createHash('sha256').update(text).digest();
}
