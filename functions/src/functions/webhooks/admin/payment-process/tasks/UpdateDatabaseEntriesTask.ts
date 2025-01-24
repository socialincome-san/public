import { DateTime } from 'luxon';
import { toFirebaseAdminTimestamp } from '../../../../../../../shared/src/firebase/admin/utils';
import {
	Payment,
	PAYMENT_AMOUNT_SLE,
	PAYMENT_FIRESTORE_PATH,
	PAYMENTS_COUNT,
	PaymentStatus,
} from '../../../../../../../shared/src/types/payment';
import { RECIPIENT_FIRESTORE_PATH, RecipientProgramStatus } from '../../../../../../../shared/src/types/recipient';
import { ExchangeRateImporter } from '../../../../cron/exchange-rate-import/ExchangeRateImporter';
import { PaymentTask } from './PaymentTask';

export class UpdateDatabaseEntriesTask extends PaymentTask {
	async run(paymentDate: DateTime): Promise<string> {
		let [paymentsPaid, paymentsCreated, setToActiveCount, setToFormerCount] = [0, 0, 0, 0];
		const nextMonthPaymentDate = paymentDate.plus({ months: 1 });
		const exchangeRates = await new ExchangeRateImporter().getExchangeRates(paymentDate);
		const amountChf = Math.round((PAYMENT_AMOUNT_SLE / exchangeRates!['SLE']!) * 100) / 100;
		const recipients = await this.getRecipients();

		await Promise.all(
			recipients.map(async (recipient) => {
				const paymentsCount = (await recipient.ref.collection('payments').count().get()).data()['count'];
				const currentMonthPaymentRef = this.firestoreAdmin.doc<Payment>(
					`${RECIPIENT_FIRESTORE_PATH}/${recipient.id}/${PAYMENT_FIRESTORE_PATH}`,
					paymentDate.toFormat('yyyy-MM'),
				);
				const currentMonthPaymentDoc = await currentMonthPaymentRef.get();
				if (!currentMonthPaymentDoc.exists || currentMonthPaymentDoc.get('status') === PaymentStatus.Created) {
					// Payments are set to paid if they have status set to created or if the document doesn't exist yet
					await currentMonthPaymentRef.set({
						amount: PAYMENT_AMOUNT_SLE,
						amount_chf: amountChf,
						currency: 'SLE',
						payment_at: toFirebaseAdminTimestamp(paymentDate),
						status: PaymentStatus.Paid,
						phone_number: recipient.get('mobile_money_phone').phone,
					});
					paymentsPaid++;
				}
				if (paymentsCount == PAYMENTS_COUNT) {
					// If a recipient has received all their payments, set their status to former
					await recipient.ref.update({
						progr_status: RecipientProgramStatus.Former,
					});
					setToFormerCount++;
				}
				const nextMonthPaymentDoc = await this.firestoreAdmin
					.doc<Payment>(
						`${RECIPIENT_FIRESTORE_PATH}/${recipient.id}/${PAYMENT_FIRESTORE_PATH}`,
						nextMonthPaymentDate.toFormat('yyyy-MM'),
					)
					.get();
				if (!nextMonthPaymentDoc.exists && paymentsCount < PAYMENTS_COUNT) {
					// Create next month's payment if recipient hasn't received all payments yet
					await this.firestoreAdmin
						.doc<Payment>(
							`${RECIPIENT_FIRESTORE_PATH}/${recipient.id}/${PAYMENT_FIRESTORE_PATH}`,
							nextMonthPaymentDate.toFormat('yyyy-MM'),
						)
						.set({
							amount: PAYMENT_AMOUNT_SLE,
							currency: 'SLE',
							payment_at: toFirebaseAdminTimestamp(nextMonthPaymentDate),
							status: PaymentStatus.Created,
						});
					paymentsCreated++;
				}
				if (recipient.get('progr_status') === RecipientProgramStatus.Designated) {
					await recipient.ref.update({
						si_start_date: paymentDate.toJSDate(),
						progr_status: RecipientProgramStatus.Active,
					});
					setToActiveCount++;
				}
			}),
		);

		return `Set status of ${paymentsPaid} payments to paid and created ${paymentsCreated} payments for next month. Set status to "former" for ${setToFormerCount} recipients and status to active for ${setToActiveCount} recipients.`;
	}
}
