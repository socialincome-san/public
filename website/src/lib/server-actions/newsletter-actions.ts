'use server';

import { getAuthenticatedContributorOrThrow } from '../firebase/current-contributor';
import { ServiceResult } from '../services/core/base.types';
import { getServices } from '../services/services';
import { CreateNewsletterSubscription, SendgridContactType } from '../services/sendgrid/types';

export const subscribeToNewsletterAction = async (subscription: CreateNewsletterSubscription) => {
	return getServices().sendgrid.subscribeToNewsletter(subscription);
};

export const getActiveSubscriptionAction = async (): Promise<ServiceResult<SendgridContactType | null>> => {
	const contributor = await getAuthenticatedContributorOrThrow();
	return getServices().sendgrid.getActiveSubscription(contributor);
};

export const unsubscribeFromNewsletterAction = async () => {
	const contributor = await getAuthenticatedContributorOrThrow();
	return getServices().sendgrid.unsubscribeFromNewsletter(contributor);
};
