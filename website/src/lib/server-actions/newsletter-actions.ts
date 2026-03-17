'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { ServiceResult } from '../services/core/base.types';
import { CreateNewsletterSubscription, SendgridContactType } from '../services/sendgrid/types';
import { services } from '../services/services';

export const subscribeToNewsletterAction = async (subscription: CreateNewsletterSubscription) => {
	return services.sendgrid.subscribeToNewsletter(subscription);
};

export const getActiveSubscriptionAction = async (): Promise<ServiceResult<SendgridContactType | null>> => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.sendgrid.getActiveSubscription(sessionResult.data);
};

export const unsubscribeFromNewsletterAction = async () => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.sendgrid.unsubscribeFromNewsletter(sessionResult.data);
};
