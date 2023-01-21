import assert from 'assert';
import * as functions from 'firebase-functions';
import _ from 'lodash';
import { doc, useFirestore } from '../../../shared/src/firebase/FirestoreAdmin';
import { TWILIO_SENDER_PHONE, CLOUD_FUNCTIONS_URL, TWILIO_SID, TWILIO_TOKEN } from '../config';
import { AdminUser, Entity, User, Recipient, MessageInbox } from '../../../shared/src/types';
import { sendSms } from '../../../shared/src/utils/messaging/sms';

export interface SendFreeMessagesProps {
    commumnicationChannel: string,
    freeTextSubject?: string,
    freeTextContent: string,
	targetAudience: string,
	messageRecipients: Entity<User | Recipient>[];
}

export const sendMessagesFunction = functions.https.onCall(
	async (
		{ commumnicationChannel, freeTextSubject, freeTextContent, targetAudience, messageRecipients }: SendFreeMessagesProps,
		{ auth }
	) => {
		const admin = (await doc<AdminUser>('admins', auth?.token?.email || '').get()).data();
		assert(admin?.is_global_admin);

		let [successCount, skippedCount] = [0, 0];

		if (commumnicationChannel === 'sms') {
			[successCount, skippedCount] = sendSmsMessage(
				freeTextContent,
				targetAudience,
				messageRecipients
			)
		}

        

        /*

		for (const messageRecipientEntity of messageRecipients) {
			try {
				if (targetAudience === 'users') {
					const user = messageRecipientEntity.values as User;
					if (user.personal?.phone) {
						if (contentType === 'template') {
							sendTemplateUserMessage(
								targetAudience,
								messageRecipientEntity.id,
								user,
								messageTemplate as MessageTemplate
							);
						} else if (contentType === 'freeText') {
							sendTwilioSMS(
								targetAudience,
								messageRecipientEntity.id,
								user.personal?.phone as string,
								freeTextContent as string
							);
						} else {
							throw new Error('Message type not found.');
						}
					} else {
						throw new Error('No phone number found for ' + user.personal?.lastname);
					}
				} else if (targetAudience === 'recipients') {
					const recipient = messageRecipientEntity.values as Recipient;
					const recipientPhoneNumber = '+' + recipient.mobile_money_phone.phone.toString();
					if (contentType === 'template') {
						SendTemplateRecipientMessage(
							targetAudience,
							messageRecipientEntity.id,
							recipientPhoneNumber,
							recipient.main_language.toLowerCase(),
							messageTemplate as MessageTemplate
						);
					} else if (contentType === 'freeText') {
						sendTwilioSMS(targetAudience, messageRecipientEntity.id, recipientPhoneNumber, freeTextContent as string);
					} else {
						throw new Error('Message type not found.');
					}
				}
				successCount += 1;
			} catch (e) {
				skippedCount += 1;
				console.error(e);
			}
		}
        */
		return `Successfully sent out ${successCount} messages (${skippedCount} skipped)`;
	}
);


const sendSmsMessage =  async (
	freeTextContent: string,
	targetAudience: string,
	messageRecipients: Entity<User | Recipient>[]
) => {
	let [successCount, skippedCount] = [0, 0];

	try {
		if (!TWILIO_SID) {
			throw new Error('No Twilio SID provided.');
		}
		if (!TWILIO_TOKEN) {
			throw new Error('No Twilio Token provided.')
		}

	} catch (e) {
		console.error(e);
		return [0, messageRecipients.length];
		
	}
	const statusCallbackUrl = new URL(CLOUD_FUNCTIONS_URL + '/sendMessagesFunction');

	for (const messageRecipientEntity of messageRecipients) {
		try {
			let messageRecipientPhone = "";
			if (targetAudience === 'users') {
				const user = messageRecipientEntity.values as User;
				messageRecipientPhone = user.personal?.phone as string;
			} else if (targetAudience === 'recipients') {
				const recipient = messageRecipientEntity.values as Recipient;
				messageRecipientPhone = '+' + recipient.mobile_money_phone.phone.toString();
			} else {
				throw new Error(`Target Audience not found (only 'recipients' or 'users').`);
			}
			const [messageSid, messageStatus] = await sendSms(
				{ messageRecipientPhone: messageRecipientPhone,
				  messageContent: freeTextContent,
				  smsServiceId: TWILIO_SID,
				  smsServiceSecret: TWILIO_TOKEN,
				  statusCallbackUrl: statusCallbackUrl,
				  messageSenderPhone: TWILIO_SENDER_PHONE
				}
			)
			await addMessageInboxItem(targetAudience, messageRecipientEntity.id, {
				date: new Date(Date.now()),
				content: freeTextContent,
				from: TWILIO_SENDER_PHONE,
				to: messageRecipientPhone,
				channel: 'SMS',
				twilio_id: messageSid,
				status: messageStatus,
			});
			successCount += 1;
		} catch (e) {
			skippedCount += 1;
			console.error(e);
		} 	         
	}
	return [successCount, skippedCount]; 
}



export const addMessageInboxItem = async (
	targetAudience: string,
	messageRecipientId: string,
	messageInboxItem: MessageInbox
) => {
	const firestore = useFirestore();
	firestore
		.collection(`${targetAudience}/${messageRecipientId}/message-inbox`)
		.doc(messageInboxItem.twilio_id)
		.set(messageInboxItem, { merge: true })
		.then(() => console.log(`Message stored for ${messageRecipientId}`));
};
