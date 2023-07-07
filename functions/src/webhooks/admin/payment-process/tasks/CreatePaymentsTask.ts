import { Timestamp } from '@google-cloud/firestore';
import { DateTime } from 'luxon';
import {
	PAYMENTS_COUNT,
	PAYMENT_AMOUNT,
	PAYMENT_CURRENCY,
	PAYMENT_FIRESTORE_PATH,
	Payment,
	PaymentStatus,
	RECIPIENT_FIRESTORE_PATH,
} from '../../../../../../shared/src/types';
import { ExchangeRateImporter } from '../../../../cron/exchange-rate-import/ExchangeRateImporter';
import { PaymentTask } from './PaymentTask';

export class CreatePaymentsTask extends PaymentTask {
	async run(paymentDate: DateTime): Promise<string> {
		let [paymentsPaid, paymentsCreated] = [0, 0];
		const nextMonthPaymentDate = paymentDate.plus({ months: 1 });
		const exchangeRates = await new ExchangeRateImporter().getExchangeRates(paymentDate);
		const amountChf = Math.round((PAYMENT_AMOUNT / exchangeRates[PAYMENT_CURRENCY]) * 100) / 100;

		for (const recipient of await this.getRecipients()) {
			const paymentsCount = (await recipient.ref.collection('payments').count().get()).data()['count'];
			const currentMonthPaymentRef = this.firestoreAdmin.doc<Payment>(
				`${RECIPIENT_FIRESTORE_PATH}/${recipient.id}/${PAYMENT_FIRESTORE_PATH}`,
				paymentDate.toFormat('yyyy-MM')
			);
			const currentMonthPaymentDoc = await currentMonthPaymentRef.get();
			if (!currentMonthPaymentDoc.exists || currentMonthPaymentDoc.get('status') === PaymentStatus.Created) {
				// Payments are set to paid if they have status set to created or if the document doesn't exist yet
				await currentMonthPaymentRef.set({
					amount: PAYMENT_AMOUNT,
					amount_chf: amountChf,
					currency: PAYMENT_CURRENCY,
					payment_at: Timestamp.fromDate(paymentDate.toJSDate()),
					status: PaymentStatus.Paid,
					phone_number: recipient.get('mobile_money_phone').phone,
				});
				paymentsPaid++;
			}
			const nextMonthPaymentDoc = await this.firestoreAdmin
				.doc<Payment>(
					`${RECIPIENT_FIRESTORE_PATH}/${recipient.id}/${PAYMENT_FIRESTORE_PATH}`,
					nextMonthPaymentDate.toFormat('yyyy-MM')
				)
				.get();
			if (!nextMonthPaymentDoc.exists && paymentsCount < PAYMENTS_COUNT) {
				// Create next month's payment if recipient hasn't received all payments yet
				await this.firestoreAdmin
					.doc<Payment>(
						`${RECIPIENT_FIRESTORE_PATH}/${recipient.id}/${PAYMENT_FIRESTORE_PATH}`,
						nextMonthPaymentDate.toFormat('yyyy-MM')
					)
					.set({
						amount: PAYMENT_AMOUNT,
						currency: PAYMENT_CURRENCY,
						payment_at: Timestamp.fromDate(nextMonthPaymentDate.toJSDate()),
						status: PaymentStatus.Created,
					});
				paymentsCreated++;
			}
		}
		return `Set ${paymentsPaid} payments to paid and created ${paymentsCreated} payments for next month`;
	}
}
