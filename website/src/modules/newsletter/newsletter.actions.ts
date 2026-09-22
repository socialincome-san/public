'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail } from '@/lib/service-result';
import { subscribeToNewsletterSchema } from './newsletter.schemas';
import { subscribeToNewsletter, unsubscribeFromNewsletter } from './newsletter.service';

export const subscribeToNewsletterAction = async (input: unknown) => {
	const parsed = subscribeToNewsletterSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid input.');
	}

	return subscribeToNewsletter(parsed.data);
};

export const unsubscribeFromNewsletterAction = async () => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return unsubscribeFromNewsletter(sessionResult.data);
};
