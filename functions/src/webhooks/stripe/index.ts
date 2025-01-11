import { DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { onRequest } from 'firebase-functions/v2/https';
import Stripe from 'stripe';
import { FirestoreAdmin } from '../../../../shared/src/firebase/admin/FirestoreAdmin';
import { SendgridSubscriptionClient } from '../../../../shared/src/sendgrid/SendgridSubscriptionClient';
import { StripeEventHandler } from '../../../../shared/src/stripe/StripeEventHandler';
import { Contribution } from '../../../../shared/src/types/contribution';
import { CountryCode } from '../../../../shared/src/types/country';
import { User } from '../../../../shared/src/types/user';
import { STRIPE_API_READ_KEY, STRIPE_WEBHOOK_SECRET } from '../../config';

const addContributorToNewsletter = async (contributionRef: DocumentReference<Contribution>) => {
	const newsletterClient = new SendgridSubscriptionClient({
		apiKey: process.env.SENDGRID_API_KEY!,
		listId: process.env.SENDGRID_LIST_ID!,
		suppressionListId: parseInt(process.env.SENDGRID_SUPPRESSION_LIST_ID!),
	});
	const user = (await contributionRef.parent.parent?.get()) as DocumentSnapshot<User>;
	logger.info(
		`Adding contributor ${user.id} (${user.get('email')}) to Sendgrid newsletter list (${process.env.SENDGRID_LIST_ID}).`,
	);
	await newsletterClient.upsertSubscription({
		firstname: user.get('personal.name'),
		lastname: user.get('personal.lastname'),
		email: user.get('email'),
		country: user.get('country') as CountryCode,
		language: user.get('language') === 'de' ? 'de' : 'en',
		isContributor: true,
	});
};

/**
 * Stripe webhook to ingest charge events into firestore.
 * Adds the relevant information to the user's contributions subcollection.
 * To test this in local development, you can use the Stripe CLI:
 * stripe listen --forward-to http://127.0.0.1:5001/demo-social-income-local/europe-west6/stripeChargeHook
 */
export default onRequest(async (request, response) => {
	const firestoreAdmin = new FirestoreAdmin();
	const stripeEventHandler = new StripeEventHandler(STRIPE_API_READ_KEY, firestoreAdmin);

	try {
		const sig = request.headers['stripe-signature']!;
		const event = stripeEventHandler.constructWebhookEvent(request.rawBody, sig, STRIPE_WEBHOOK_SECRET);
		const charge = event.data.object as Stripe.Charge;
		switch (event.type) {
			case 'charge.succeeded':
			case 'charge.failed': {
				const contributionRef = await stripeEventHandler.handleChargeEvent(charge);
				logger.info(`Charge event ${event.type} handled for charge ${charge.id}.`);
				if (contributionRef) {
					logger.info(`Created contribution ${contributionRef.id}. Adding contributor to newsletter.`);
					try {
						await addContributorToNewsletter(contributionRef);
					} catch (error) {
						logger.error(`Failed to add contributor to newsletter: ${error}`);
					}
				}
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
