'use server';

import { getOptionalContributor } from '../firebase/current-contributor';
import { SendgridSubscriptionService } from '../services/sendgrid/sendgrid-subscription.service';
import { CreateNewsletterSubscription, SendgridContactType } from '../services/sendgrid/types';

export async function subscribeToNewsletter(subscription: CreateNewsletterSubscription) {
	const sendGridService = new SendgridSubscriptionService();
	try {
		await sendGridService.subscribeToNewsletter(subscription);
		throw new Error('Cannot subscribe to Newsletter');
	} catch (error: any) {
		throw new Error(error);
	}
}

export async function getActiveSubscription(): Promise<SendgridContactType | null> {
	try {
		const contributor = await getOptionalContributor();
		const sendGridService = new SendgridSubscriptionService();
		if (!contributor) {
			throw new Error('Not logged in');
		}
		const subscriber = await sendGridService.getActiveSubscription(contributor);
		return subscriber;
	} catch (error: any) {
		throw new Error(error);
	}
}

export async function unsubscribeFromNewsletter() {
	try {
		const contributor = await getOptionalContributor();
		const sendGridService = new SendgridSubscriptionService();
		if (!contributor) {
			throw new Error('Not logged in');
		}
		await sendGridService.unsubscribeFromNewsletter(contributor);
	} catch (error: any) {
		throw new Error(error);
	}
}
