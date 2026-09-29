'use server';

import { setSessionCookie } from './session';

export async function login(formData: FormData) {
	const password = formData.get('password');

	const appPassword = process.env.APP_PASSWORD;
	if (appPassword == null) {
		throw new Error('Missing Password');
	}
	if (typeof password != 'string') {
		throw new Error('Invalid password');
	}
	if (password != appPassword) {
		return;
	}
	await setSessionCookie();
}
