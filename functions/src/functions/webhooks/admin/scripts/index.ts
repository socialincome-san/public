import { logger } from 'firebase-functions';
import { onCall } from 'firebase-functions/v2/https';
import { FirestoreAdmin } from '../../../../../../shared/src/firebase/admin/FirestoreAdmin';
import { StripeEventHandler } from '../../../../../../shared/src/stripe/StripeEventHandler';
import { STRIPE_API_READ_KEY } from '../../../../config';
import { PaymentsManager } from './PaymentsManager';
import { SurveyManager } from './SurveyManager';

/**
 * Batch implementation to create all surveys for all recipients.
 * Checks for existing surveys and ignores them. So, it can be called multiple times without creating duplicates.
 * The default memory limit of 256MB is not enough for this function.
 */
const createAllSurveysFunction = onCall({ memory: '2GiB' }, async ({ auth }) => {
	const firestoreAdmin = new FirestoreAdmin();
	await firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

	const surveyManager = new SurveyManager();
	await surveyManager.batchCreateSurveys();
});

const addMissingAmountChfFunction = onCall(async ({ auth }) => {
	const firestoreAdmin = new FirestoreAdmin();
	await firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

	const paymentsManager = new PaymentsManager();
	await paymentsManager.batchAddPayments();
});

const batchImportStripeChargesFunction = onCall({ memory: '2GiB', timeoutSeconds: 3600 }, async ({ auth }) => {
	const firestoreAdmin = new FirestoreAdmin();
	await firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

	const stripeEventHandler = new StripeEventHandler(STRIPE_API_READ_KEY, firestoreAdmin);
	const stripeBatchSize = 100; // max batch size supported by stripe
	const charges = [];
	try {
		logger.info('Querying Stripe API...');
		for await (const charge of stripeEventHandler.stripe.charges.list({
			expand: ['data.balance_transaction', 'data.invoice'],
			limit: stripeBatchSize,
		})) {
			charges.push(charge);
		}
		logger.info(`Querying stripe finished.`);

		await Promise.all(
			charges.map((charge) => {
				try {
					stripeEventHandler.storeCharge(charge, null);
				} catch (error) {
					logger.error(error);
				}
			}),
		);
		logger.info(`Ingestion finished.`);
	} catch (error) {
		logger.error(error);
		throw error;
	}
});

export { addMissingAmountChfFunction, batchImportStripeChargesFunction, createAllSurveysFunction };
