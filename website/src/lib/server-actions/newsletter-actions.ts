'use server';

import { getAuthenticatedContributorOrThrow } from '../firebase/current-contributor';
import { ServiceResult } from '../services/core/base.types';
import { SendgridSubscriptionService } from '../services/sendgrid/sendgrid-subscription.service';
import { CreateNewsletterSubscription, SendgridContactType } from '../services/sendgrid/types';

export async function subscribeToNewsletter(subscription: CreateNewsletterSubscription) {
	const sendGridService = new SendgridSubscriptionService();
	return await sendGridService.subscribeToNewsletter(subscription);
}

export async function getActiveSubscription(): Promise<ServiceResult<SendgridContactType | null>> {
	const contributor = await getAuthenticatedContributorOrThrow();
	const sendGridService = new SendgridSubscriptionService();
	const subscriber = await sendGridService.getActiveSubscription(contributor);
	return subscriber;
}

export async function unsubscribeFromNewsletter() {
	const contributor = await getAuthenticatedContributorOrThrow();
	const sendGridService = new SendgridSubscriptionService();
	return await sendGridService.unsubscribeFromNewsletter(contributor);
}
