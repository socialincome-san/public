import * as functions from 'firebase-functions';
import { FirestoreAdmin } from '../../../../../shared/src/firebase/admin/FirestoreAdmin';
import { StripeEventHandler } from '../../../../../shared/src/stripe/StripeEventHandler';
import { STRIPE_API_READ_KEY } from '../../../config';
import { PaymentsManager } from './PaymentsManager';
import { SurveyManager } from './SurveyManager';

/**
 * Batch implementation to create all surveys for all recipients.
 * Checks for existing surveys and ignores them. So, it can be called multiple times without creating duplicates.
 */
const createAllSurveysFunction = functions
	.runWith({
		timeoutSeconds: 540,
		memory: '2GB',
	})
	.https.onCall(async (_, { auth }) => {
		const firestoreAdmin = new FirestoreAdmin();
		await firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

		const surveyManager = new SurveyManager();
		await surveyManager.batchCreateSurveys();
	});

const addMissingAmountChfFunction = functions
	.runWith({
		timeoutSeconds: 540,
		memory: '1GB',
	})
	.https.onCall(async (_, { auth }) => {
		const firestoreAdmin = new FirestoreAdmin();
		await firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

		const paymentsManager = new PaymentsManager();
		await paymentsManager.batchAddPayments();
	});

const batchImportStripeChargesFunction = functions
	.runWith({
		timeoutSeconds: 540, // max timeout supported by firebase
	})
	.https.onCall(async (_, { auth }) => {
		const firestoreAdmin = new FirestoreAdmin();
		await firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

		const stripeEventHandler = new StripeEventHandler(STRIPE_API_READ_KEY, firestoreAdmin);
		const stripeBatchSize = 100; // max batch size supported by stripe
		const charges = [];
		try {
			functions.logger.info('Querying Stripe API...');
			for await (const charge of stripeEventHandler.stripe.charges.list({
				expand: ['data.balance_transaction', 'data.invoice'],
				limit: stripeBatchSize,
			})) {
				charges.push(charge);
			}
			functions.logger.info(`Querying stripe finished.`);

			await Promise.all(
				charges.map((charge) => {
					try {
						stripeEventHandler.storeCharge(charge);
					} catch (error) {
						functions.logger.error(error);
					}
				}),
			);
			functions.logger.info(`Ingestion finished.`);
		} catch (error) {
			functions.logger.error(error);
			throw error;
		}
	});

export { addMissingAmountChfFunction, batchImportStripeChargesFunction, createAllSurveysFunction };
