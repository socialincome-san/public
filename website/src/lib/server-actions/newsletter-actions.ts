'use server';

import { getAuthenticatedContributorOrThrow } from '../firebase/current-contributor';
import { ServiceResult } from '../services/core/base.types';
import { SendgridSubscriptionService } from '../services/sendgrid/sendgrid-subscription.service';
import { CreateNewsletterSubscription, SendgridContactType } from '../services/sendgrid/types';

export async function subscribeToNewsletterAction(subscription: CreateNewsletterSubscription) {
	const sendGridService = new SendgridSubscriptionService();
	return sendGridService.subscribeToNewsletter(subscription);
}

export async function getActiveSubscriptionAction(): Promise<ServiceResult<SendgridContactType | null>> {
	const contributor = await getAuthenticatedContributorOrThrow();
	const sendGridService = new SendgridSubscriptionService();
	return sendGridService.getActiveSubscription(contributor);
}

export async function unsubscribeFromNewsletterAction() {
	const contributor = await getAuthenticatedContributorOrThrow();
	const sendGridService = new SendgridSubscriptionService();
	return sendGridService.unsubscribeFromNewsletter(contributor);
}
