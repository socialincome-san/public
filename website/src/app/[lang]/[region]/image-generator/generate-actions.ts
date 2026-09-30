'use server';

import { isSessionValid } from './session';

export async function generateImage(prevState: string | null, formData: FormData): Promise<string | null> {
	const authenticated = await isSessionValid();
	if (!authenticated) {
		return 'Unauthorized';
	}
	const prompt = formData.get('prompt');
	if (typeof prompt !== 'string') {
		return 'Missing Prompt';
	}
	if (prompt.trim() === '') {
		return 'Cant send without text';
	}

	return null;
}
