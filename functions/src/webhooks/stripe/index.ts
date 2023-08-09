import * as functions from 'firebase-functions';
import { initializeStripe } from '../../../../shared/src/stripe';
import { STRIPE_API_READ_KEY, STRIPE_WEBHOOK_SECRET } from '../../config';
import { StripeWebhook } from './StripeWebhook';

/**
 * Stripe webhook to ingest charge events into firestore.
 * Adds the relevant information to the contributions subcollection of users.
 */
export default functions.https.onRequest(async (request, response) => {
	const stripe = initializeStripe(STRIPE_API_READ_KEY);
	const stripeWebhook = new StripeWebhook();
	try {
		const sig = request.headers['stripe-signature']!;
		const event = stripe.webhooks.constructEvent(request.rawBody, sig, STRIPE_WEBHOOK_SECRET);
		switch (event.type) {
			case 'charge.succeeded': {
				await stripeWebhook.handleChargeEvent(event, stripe);
				break;
			}
			case 'charge.failed': {
				await stripeWebhook.handleChargeEvent(event, stripe);
				break;
			}
			default: {
				functions.logger.info(`Unhandled event type ${event.type}`);
			}
		}
		response.send();
	} catch (error) {
		functions.logger.error(error);
		response.status(500).send(`Webhook Error. Check the logs.`);
	}
});
