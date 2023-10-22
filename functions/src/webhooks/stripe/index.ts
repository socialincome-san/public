import { logger } from 'firebase-functions';
import { onRequest } from 'firebase-functions/v2/https';
import Stripe from 'stripe';
import { FirestoreAdmin } from '@socialincome/shared/src/firebase/admin/FirestoreAdmin';
import { StripeEventHandler } from '@socialincome/shared/src/stripe/StripeEventHandler';
import { STRIPE_API_READ_KEY, STRIPE_WEBHOOK_SECRET } from '../../config';

/**
 * Stripe webhook to ingest charge events into firestore.
 * Adds the relevant information to the contributions subcollection of users.
 */
export default onRequest(async (request, response) => {
	const stripeEventHandler = new StripeEventHandler(STRIPE_API_READ_KEY, new FirestoreAdmin());
	try {
		const sig = request.headers['stripe-signature']!;
		const event = stripeEventHandler.constructWebhookEvent(request.rawBody, sig, STRIPE_WEBHOOK_SECRET);
		switch (event.type) {
			case 'charge.succeeded':
			case 'charge.failed': {
				await stripeEventHandler.handleChargeEvent(event.data.object as Stripe.Charge);
				break;
			}
			default: {
				logger.info(`Unhandled event type ${event.type}`);
			}
		}
		response.send();
	} catch (error) {
		logger.error(error);
		response.status(500).send(`Webhook Error. Check the logs.`);
	}
});
