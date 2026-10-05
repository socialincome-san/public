'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail, type Result } from '@/lib/result';
import { subscribeToNewsletterSchema } from './newsletter.schemas';
import { subscribeToNewsletter, unsubscribeFromNewsletter } from './newsletter.service';

export const subscribeToNewsletterAction = async (input: unknown): Promise<Result<void>> => {
	const parsed = subscribeToNewsletterSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid input.');
	}

	return subscribeToNewsletter(parsed.data);
};

export const unsubscribeFromNewsletterAction = async (): Promise<Result<void>> => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return unsubscribeFromNewsletter(sessionResult.data);
};
