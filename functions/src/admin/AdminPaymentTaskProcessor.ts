import { QueryDocumentSnapshot } from '@google-cloud/firestore';
import * as functions from 'firebase-functions';
import sortBy from 'lodash/sortBy';
import moment from 'moment';

import { Timestamp } from '@google-cloud/firestore';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import {
	AdminPaymentProcessTask,
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
		let paymentsCreated = 0;
		const now = moment();

		for (const recipientDoc of recipientDocs) {
			if (recipientDoc.data().test_recipient) continue;

			const paymentDocRef = this.firestoreAdmin.doc<Payment>(
				`${RECIPIENT_FIRESTORE_PATH}/${recipientDoc.id}/${PAYMENT_FIRESTORE_PATH}`,
				now.format('YYYY-MM')
			);
			if (!(await paymentDocRef.get()).exists) {
				await paymentDocRef.set({
					amount: PAYMENT_AMOUNT,
					currency: PAYMENT_CURRENCY,
					payment_at: Timestamp.fromDate(now.toDate()),
					status: PaymentStatus.Paid,
				});
				paymentsCreated++;
			}
		}
		return `Created ${paymentsCreated} payments`;
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
