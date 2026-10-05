'use server';

import { resultFail, type Result } from '@/lib/result';
import { getSessionByType } from '@/modules/auth/session.service';
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
