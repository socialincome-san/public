import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { STRIPE_API_READ_KEY } from '../../../config';
import { FunctionProvider } from '../../../firebase';
import { StripeWebhook } from '../../stripe/StripeWebhook';

/**
 * One off script to import existing stripe payments into firestore.
 * Continuous update is done through the [stripeWebhook].
 */
export class BatchImportStripeCharges extends StripeWebhook implements FunctionProvider {
	getFunction = () =>
		functions
			.runWith({
				timeoutSeconds: 540, // max timeout supported by firebase
			})
			.https.onCall(async (_, { auth }) => {
				await this.firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

				const stripeBatchSize = 100; // max batch size supported by stripe
				const charges = [];
				try {
					const stripe = new Stripe(STRIPE_API_READ_KEY, { apiVersion: '2022-08-01' });
					functions.logger.info('Querying Stripe API...');
					for await (const charge of stripe.charges.list({
						expand: ['data.balance_transaction', 'data.invoice'],
						limit: stripeBatchSize,
					})) {
						charges.push(charge);
					}
					functions.logger.info(`Querying stripe finished.`);

					await Promise.all(charges.map((charge) => this.storeCharge(charge)));
					functions.logger.info(`Ingestion finished.`);
				} catch (error) {
					functions.logger.error(error);
					throw error;
				}
			});
}
