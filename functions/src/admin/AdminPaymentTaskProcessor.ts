import { QueryDocumentSnapshot } from '@google-cloud/firestore';
import * as functions from 'firebase-functions';
import sortBy from 'lodash/sortBy';

import { Timestamp } from '@google-cloud/firestore';
import { DateTime } from 'luxon';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import {
	AdminPaymentProcessTask,
	calcLastPaymentDate,
	MESSAGE_FIRESTORE_PATH,
	Payment,
	PaymentStatus,
	PAYMENT_AMOUNT,
	PAYMENT_CURRENCY,
	PAYMENT_FIRESTORE_PATH,
	Recipient,
	RecipientProgramStatus,
	RECIPIENT_FIRESTORE_PATH,
	SMS,
} from '../../../shared/src/types';
import { sendSms } from '../../../shared/src/utils/messaging/sms';
import { TWILIO_SENDER_PHONE, TWILIO_SID, TWILIO_TOKEN } from '../config';

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

	private sendNotifications = async (recipientDocs: QueryDocumentSnapshot<Recipient>[]) => {
		let [notificationsSent, existingNotifications, failedMessages] = [0, 0, 0];
		const now = DateTime.now();

		for (const recipientDoc of recipientDocs) {
			if (recipientDoc.data().test_recipient) continue;

			const paymentDocRef = this.firestoreAdmin.doc<Payment>(
				`${RECIPIENT_FIRESTORE_PATH}/${recipientDoc.id}/${PAYMENT_FIRESTORE_PATH}`,
				now.toFormat('yyyy-MM')
			);

			if ((await paymentDocRef.get()).exists) {
				const paymentDocSnap = await paymentDocRef.get();
				const payment = paymentDocSnap.data() as Payment;
				if (!payment.message) {
					try {
						const recipient: Recipient = recipientDoc.data();
						const message: MessageInstance = await sendSms({
							from: TWILIO_SENDER_PHONE,
							to: `+${recipient.mobile_money_phone.phone}`,
							twilioConfig: { sid: TWILIO_SID, token: TWILIO_TOKEN },
							templateProps: {
								hbsTemplatePath: 'sms/freetext.hbs',
								context: {
									content: 'You should have received a payment by Social Income. If you have not, please contact us.',
								},
							},
						});
						const messageCollection = this.firestoreAdmin.collection<SMS>(
							`${RECIPIENT_FIRESTORE_PATH}/${recipientDoc.id}/${MESSAGE_FIRESTORE_PATH}`
						);
						const messageDocRef = await messageCollection.add({ type: 'sms', ...message.toJSON() });
						await paymentDocRef.update({ message: messageDocRef });
					} catch (error) {
						console.error(error);
						failedMessages += 1;
					}
					notificationsSent++;
				} else {
					existingNotifications++;
				}
			} else {
				console.log("Payment doesn't exist", paymentDocRef.path);
			}
		}
		return `Sent ${notificationsSent} new payment notifications — ${existingNotifications} already sent, ${failedMessages} failed to send`;
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
		if (task === AdminPaymentProcessTask.SendNotifications) {
			return this.sendNotifications(recipientDocs);
		}

		throw new functions.https.HttpsError('invalid-argument', 'Invalid AdminPaymentProcessTask');
	});
}
