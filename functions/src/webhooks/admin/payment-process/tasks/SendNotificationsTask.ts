import { QueryDocumentSnapshot } from '@google-cloud/firestore';
import { DateTime } from 'luxon';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { FirestoreAdmin } from '../../../../../../shared/src/firebase/admin/FirestoreAdmin';
import {
	MESSAGE_FIRESTORE_PATH,
	MessageType,
	PAYMENT_FIRESTORE_PATH,
	Payment,
	RECIPIENT_FIRESTORE_PATH,
	Recipient,
	TwilioMessage,
} from '../../../../../../shared/src/types';
import { sendSms } from '../../../../../../shared/src/utils/messaging/sms';
import { TWILIO_SENDER_PHONE, TWILIO_SID, TWILIO_TOKEN } from '../../../../config';

export class SendNotificationsTask {
	recipients: QueryDocumentSnapshot<Recipient>[];
	firestoreAdmin: FirestoreAdmin;

	constructor(recipients: QueryDocumentSnapshot<Recipient>[], firestoreAdmin: FirestoreAdmin) {
		this.recipients = recipients;
		this.firestoreAdmin = firestoreAdmin;
	}
	async run(): Promise<string> {
		let [notificationsSent, existingNotifications, failedMessages] = [0, 0, 0];
		const now = DateTime.now();

		for (const recipientDoc of this.recipients) {
			if (recipientDoc.get('test_recipient')) continue;

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
								hbsTemplatePath: 'message/freetext.hbs',
								context: {
									content: 'You should have received a payment by Social Income. If you have not, please contact us.',
								},
							},
						});
						const messageCollection = this.firestoreAdmin.collection<TwilioMessage>(
							`${RECIPIENT_FIRESTORE_PATH}/${recipientDoc.id}/${MESSAGE_FIRESTORE_PATH}`
						);
						const messageDocRef = await messageCollection.add({ type: MessageType.SMS, ...message.toJSON() });
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
	}
}
