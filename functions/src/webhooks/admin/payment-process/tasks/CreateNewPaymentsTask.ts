import { QueryDocumentSnapshot, Timestamp } from '@google-cloud/firestore';
import { DateTime } from 'luxon';
import { FirestoreAdmin } from '../../../../../../shared/src/firebase/FirestoreAdmin';
import {
	ExchangeRates,
	PAYMENT_AMOUNT,
	PAYMENT_CURRENCY,
	PAYMENT_FIRESTORE_PATH,
	Payment,
	PaymentStatus,
	RECIPIENT_FIRESTORE_PATH,
	Recipient,
	calcLastPaymentDate,
} from '../../../../../../shared/src/types';
import { PaymentTask } from '../PaymentTaskProcessor';

export class CreateNewPaymentsTask implements PaymentTask {
	private readonly recipients: QueryDocumentSnapshot<Recipient>[];
	private readonly exchangeRates: ExchangeRates;
	private readonly firestoreAdmin: FirestoreAdmin;

	constructor(
		recipients: FirebaseFirestore.QueryDocumentSnapshot<Recipient>[],
		exchangeRates: ExchangeRates,
		firestoreAdmin: FirestoreAdmin
	) {
		this.recipients = recipients;
		this.exchangeRates = exchangeRates;
		this.firestoreAdmin = firestoreAdmin;
	}

	async run(): Promise<string> {
		let [paymentsPaid, paymentsCreated] = [0, 0];
		const thisMonthPaymentDate = DateTime.fromObject({ day: 15, hour: 0, minute: 0, second: 0, millisecond: 0 });
		const nextMonthPaymentDate = thisMonthPaymentDate.plus({ months: 1 });

		const amountChf = Math.round((PAYMENT_AMOUNT / this.exchangeRates[PAYMENT_CURRENCY]) * 100) / 100;

		for (const recipient of this.recipients) {
			if (recipient.get('test_recipient')) continue;

			const currentMonthPaymentRef = this.firestoreAdmin.doc<Payment>(
				`${RECIPIENT_FIRESTORE_PATH}/${recipient.id}/${PAYMENT_FIRESTORE_PATH}`,
				thisMonthPaymentDate.toFormat('yyyy-MM')
			);
			const currentMonthPaymentDoc = await currentMonthPaymentRef.get();
			// Payments are set to paid if they have status set to created or if the document doesn't exist yet
			if (!currentMonthPaymentDoc.exists || currentMonthPaymentDoc.get('status') === PaymentStatus.Created) {
				await currentMonthPaymentRef.set({
					amount: PAYMENT_AMOUNT,
					amount_chf: amountChf,
					currency: PAYMENT_CURRENCY,
					payment_at: Timestamp.fromDate(thisMonthPaymentDate.toJSDate()),
					status: PaymentStatus.Paid,
					phone_number: recipient.get('mobile_money_phone').phone,
				});
				paymentsPaid++;
			}

			const nextMonthPaymentRef = this.firestoreAdmin.doc<Payment>(
				`${RECIPIENT_FIRESTORE_PATH}/${recipient.id}/${PAYMENT_FIRESTORE_PATH}`,
				nextMonthPaymentDate.toFormat('yyyy-MM')
			);
			const nextMonthPaymentDoc = await nextMonthPaymentRef.get();
			const lastPaymentDate = calcLastPaymentDate(recipient.get('si_start_date').toDate());
			if (!nextMonthPaymentDoc.exists && nextMonthPaymentDate <= lastPaymentDate) {
				await nextMonthPaymentRef.set({
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
