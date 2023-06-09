import { ExchangeRates, Payment, PAYMENT_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import * as functions from 'firebase-functions';
import { ExchangeRateImporter } from '../../../cron/ExchangeRateImporter';
import { AbstractFirebaseAdmin, FunctionProvider } from '../../../firebase';

export class BatchAddCHFToPayments extends AbstractFirebaseAdmin implements FunctionProvider {
	private readonly exchangeRateImporter: ExchangeRateImporter;

	constructor() {
		super();
		this.exchangeRateImporter = new ExchangeRateImporter();
	}

	static calcAmountChf(exchangeRates: Map<number, ExchangeRates>, payment: Payment): number | null {
		const paymentDayTimestamp = Math.floor(payment.payment_at.seconds / 86400) * 86400;
		const exchangeRatesAtPaymentDate = exchangeRates.get(paymentDayTimestamp);
		// no exchange rate available
		if (!exchangeRatesAtPaymentDate) {
			return null;
		}
		const exactExchangeRate = exchangeRatesAtPaymentDate[payment.currency];
		// currency mapping is available
		if (exactExchangeRate) {
			return Math.round((payment.amount / exactExchangeRate) * 100) / 100;
		}
		// switching from SLL to SLE we only got the SLE exchange rate with a delay. We use SLE * 1000 in this case.
		const sllExchangeRate = exchangeRatesAtPaymentDate['SLL'];
		if (payment.currency === 'SLE' && sllExchangeRate) {
			return Math.round((payment.amount / sllExchangeRate) * 1000 * 100) / 100;
		}
		// currency not found
		return null;
	}

	/**
	 * Batch implementation to add amount_chf for past payments
	 */
	getFunction() {
		return functions
			.runWith({
				timeoutSeconds: 540,
				memory: '1GB',
			})
			.https.onCall(async (_, { auth }) => {
				await this.firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

				const dailyExchangeRates = await this.exchangeRateImporter.getAllExchangeRates();
				const payments = await this.firestoreAdmin.collectionGroup<Payment>(PAYMENT_FIRESTORE_PATH).get();
				for (const payment of payments.docs.filter((d) => !d.data().amount_chf)) {
					const amountChf = BatchAddCHFToPayments.calcAmountChf(dailyExchangeRates, payment.data());
					if (amountChf) {
						await payment.ref.update({
							amount_chf: amountChf,
						});
						console.log(`Updated amount_chf for payment: ${payment.ref.path}`);
					} else {
						console.warn(`Could not update amount_chf for payment: ${payment.ref.path}`);
					}
				}
			});
	}
}
