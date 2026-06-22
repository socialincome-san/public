'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { CreateNewsletterSubscription } from '../services/sendgrid/types';
import { services } from '../services/services';

export const subscribeToNewsletterAction = async (subscription: CreateNewsletterSubscription) => {
	return services.sendgrid.subscribeToNewsletter(subscription);
};

export const unsubscribeFromNewsletterAction = async () => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.sendgrid.unsubscribeFromNewsletter(sessionResult.data);
};
