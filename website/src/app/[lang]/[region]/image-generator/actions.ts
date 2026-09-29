'use server';

import { setSessionCookie } from './session';

export async function login(prevState: string | null, formData: FormData): Promise<string | null> {
	const password = formData.get('password');

	const appPassword = process.env.APP_PASSWORD;
	if (appPassword == null) {
		throw new Error('Missing Password');
	}
	if (typeof password != 'string') {
		throw new Error('Invalid password');
	}
	if (password != appPassword) {
		return 'Wrong password';
	}
	await setSessionCookie();
	return null;
}
