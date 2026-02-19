'use server';

import { getAuthenticatedContributorOrThrow } from '../firebase/current-contributor';
import { ServiceResult } from '../services/core/base.types';
import { SendgridSubscriptionService } from '../services/sendgrid/sendgrid-subscription.service';
import { CreateNewsletterSubscription, SendgridContactType } from '../services/sendgrid/types';

export const subscribeToNewsletterAction = async (subscription: CreateNewsletterSubscription) => {
	const sendGridService = new SendgridSubscriptionService();
	return sendGridService.subscribeToNewsletter(subscription);
}

export const getActiveSubscriptionAction = async (): Promise<ServiceResult<SendgridContactType | null>> => {
	const contributor = await getAuthenticatedContributorOrThrow();
	const sendGridService = new SendgridSubscriptionService();
	return sendGridService.getActiveSubscription(contributor);
}

export const unsubscribeFromNewsletterAction = async () => {
	const contributor = await getAuthenticatedContributorOrThrow();
	const sendGridService = new SendgridSubscriptionService();
	return sendGridService.unsubscribeFromNewsletter(contributor);
}
