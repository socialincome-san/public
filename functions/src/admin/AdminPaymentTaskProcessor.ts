import { QueryDocumentSnapshot } from '@google-cloud/firestore';
import * as functions from 'firebase-functions';
import sortBy from 'lodash/sortBy';

import { Timestamp } from '@google-cloud/firestore';
import { DateTime } from 'luxon';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import {
	AdminPaymentProcessTask,
	calcLastPaymentDate,
	Payment,
	PaymentStatus,
	PAYMENT_AMOUNT,
	PAYMENT_CURRENCY,
	PAYMENT_FIRESTORE_PATH,
	Recipient,
	RecipientProgramStatus,
	RECIPIENT_FIRESTORE_PATH,
} from '../../../shared/src/types';

export class AdminPaymentTaskProcessor {
	readonly firestoreAdmin: FirestoreAdmin;

	constructor(firestoreAdmin: FirestoreAdmin) {
		this.firestoreAdmin = firestoreAdmin;
	}

	private getRowsForRegistrationCSV = (recipients: Recipient[]) => {
		const csvRows = [['Mobile Number*', 'Unique Code*', 'User Type*']];
		for (const recipient of recipients) {
			csvRows.push([
				recipient.mobile_money_phone.phone.toString().slice(-8),
				recipient.om_uid.toString(),
				'subscriber',
			]);
		}
		return csvRows.map((row) => row.join(',')).join('\n');
	};

	private getRowsForPaymentCSV = (recipients: Recipient[]) => {
		const date = new Date();
		const csvRows = [['Mobile Number*', 'Amount*', 'First Name', 'Last Name', 'Id Number', 'Remarks*', 'User Type*']];
		for (const recipient of recipients) {
			csvRows.push([
				recipient.mobile_money_phone.phone.toString().slice(-8),
				PAYMENT_AMOUNT.toString(),
				recipient.first_name,
				recipient.last_name,
				recipient.om_uid.toString(),
				`Social Income ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
				'subscriber',
			]);
		}
		return csvRows.map((row) => row.join(',')).join('\n');
	};

	private createNewPayments = async (recipientDocs: QueryDocumentSnapshot<Recipient>[]) => {
		let [paymentsPaid, paymentsCreated] = [0, 0];
		const thisMonthPaymentDate = DateTime.fromObject({ day: 15, hour: 0, minute: 0, second: 0, millisecond: 0 });
		const nextMonthPaymentDate = thisMonthPaymentDate.plus({ months: 1 });

		for (const recipientDoc of recipientDocs) {
			if (recipientDoc.data().test_recipient) continue;

			const currentMonthPaymentRef = this.firestoreAdmin.doc<Payment>(
				`${RECIPIENT_FIRESTORE_PATH}/${recipientDoc.id}/${PAYMENT_FIRESTORE_PATH}`,
				thisMonthPaymentDate.toFormat('yyyy-MM')
			);
			const currentMonthPaymentDoc = await currentMonthPaymentRef.get();
			// Payments are set to paid if they have status set to created or if the document doesn't exist yet
			if (!currentMonthPaymentDoc.exists || currentMonthPaymentDoc.get('status') === PaymentStatus.Created) {
				await currentMonthPaymentRef.set({
					amount: PAYMENT_AMOUNT,
					currency: PAYMENT_CURRENCY,
					payment_at: Timestamp.fromDate(thisMonthPaymentDate.toJSDate()),
					status: PaymentStatus.Paid,
					phone_number: recipientDoc.get('mobile_money_phone.phone'),
				});
				paymentsPaid++;
			}

			const nextMonthPaymentRef = this.firestoreAdmin.doc<Payment>(
				`${RECIPIENT_FIRESTORE_PATH}/${recipientDoc.id}/${PAYMENT_FIRESTORE_PATH}`,
				nextMonthPaymentDate.toFormat('yyyy-MM')
			);
			const nextMonthPaymentDoc = await nextMonthPaymentRef.get();
			const lastPaymentDate = calcLastPaymentDate(recipientDoc.get('si_start_date').toDate());
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
	};

	runTask = functions.https.onCall(async (task: AdminPaymentProcessTask, { auth }) => {
		await this.firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

		const recipientDocs = (
			await this.firestoreAdmin
				.collection<Recipient>(RECIPIENT_FIRESTORE_PATH)
				.where('progr_status', 'in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated])
				.get()
		).docs;

		if (task === AdminPaymentProcessTask.CreateNewPayments) {
			return await this.createNewPayments(recipientDocs);
		}
		const recipientsSorted = sortBy(
			recipientDocs.map((doc) => doc.data() as Recipient).filter((r) => !r.test_recipient),
			(r) => r.om_uid
		);
		if (task === AdminPaymentProcessTask.GetRegistrationCSV) {
			return this.getRowsForRegistrationCSV(recipientsSorted);
		}
		if (task === AdminPaymentProcessTask.GetPaymentCSV) {
			return this.getRowsForPaymentCSV(recipientsSorted);
		}

		throw new functions.https.HttpsError('invalid-argument', 'Invalid AdminPaymentProcessTask');
	});
}
