'use server';

import { SendgridSubscriptionService } from '../services/sendgrid/sendgrid-subscription.service';
import { CreateNewsletterSubscription } from '../services/sendgrid/types';

export async function subscribeToNewsletter(subscription: CreateNewsletterSubscription) {
	const sendGridService = new SendgridSubscriptionService();
	try {
		await sendGridService.subscribeToNewsletter(subscription);
		throw new Error('Cannot subscribe to Newsletter');
	} catch (error: any) {
		throw new Error(error);
	}
}
