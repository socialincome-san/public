import assert from 'assert';
import * as functions from 'firebase-functions';
import _ from 'lodash';
import { doc, useFirestore } from '../../../shared/src/firebase/firestoreAdmin';
import { TWILIO_SENDER_PHONE, CLOUD_FUNCTIONS_URL } from '../config';
import { AdminUser, Entity, User, MessageTemplate, MessageInbox, Recipient } from '../../../shared/src/types';

export interface SendUserMessagesFunctionProps {
	targetAudience: string;
	messageRecipients: Entity<User | Recipient>[];
	contentType: string;
	messageTemplate?: MessageTemplate;
	freeTextContent?: string;
}

export const sendMessagesFunction = functions.https.onCall(
	async ({ targetAudience, messageRecipients, contentType, messageTemplate, freeTextContent }: SendUserMessagesFunctionProps, { auth }) => {
		const admin = (await doc<AdminUser>('admins', auth?.token?.email || '').get()).data();
		assert(admin?.is_global_admin);

		let [successCount, skippedCount] = [0, 0];
		
		for (const messageRecipientEntity of messageRecipients) {
			try {
				if (targetAudience === "users") {
					const user = messageRecipientEntity.values as User;
					if ( user.personal?.phone) {
						if ( contentType === "template") {
							sendTemplateUserMessage(targetAudience, messageRecipientEntity.id, user, messageTemplate as MessageTemplate);
						} else if ( contentType === "freeText") {
							sendTwilioSMS(targetAudience, messageRecipientEntity.id, user.personal?.phone as string, freeTextContent as string);
						} else {
							throw new Error("Message type not found.");
						}
					} else {
						throw new Error('No phone number found for ' + user.personal?.lastname);
					}
					
				} else if (targetAudience === "recipients") {
					const recipient = messageRecipientEntity.values as Recipient;
					const recipientPhoneNumber = "+" + recipient.mobile_money_phone.phone.toString();
					if ( contentType === "template") {
						SendTemplateRecipientMessage(targetAudience, messageRecipientEntity.id, recipientPhoneNumber, recipient.main_language.toLowerCase(), messageTemplate as MessageTemplate);
					} else if ( contentType === "freeText") {
						sendTwilioSMS(targetAudience, messageRecipientEntity.id, recipientPhoneNumber, freeTextContent as string);
					} else {
						throw new Error("Message type not found.");
					}
				}
				successCount += 1;
			} catch (e) {
				skippedCount += 1;
				console.error(e);
			}	
		}	
		return `Successfully sent out ${successCount} messages (${skippedCount} skipped)`;
	}
);

export const sendTemplateUserMessage = (targetAudience: string, messageRecipientId: string, user: User, messageTemplate: MessageTemplate) => {
	let messageContent = "";
	_.forEach(messageTemplate.translations, function(value, key) {
		if ( key === user.language?.toLowerCase()) {
			messageContent = value;
		}
	})
	if ( messageContent.length === 0) {
		messageContent = messageTemplate.translation_default_en
	}
	sendTwilioSMS(targetAudience, messageRecipientId, user.personal?.phone as string, messageContent);
};

export const SendTemplateRecipientMessage = (
	targetAudience: string,
	messageRecipientId: string,
	recipientPhoneNumber: string,
	recipientMainLanguage: string,
	messageTemplate: MessageTemplate) => {
		let messageContent = "";
		_.forEach(messageTemplate.translations, function(value, key) {
			if ( key === recipientMainLanguage) {
				messageContent = value;
			}
		})
		if ( messageContent.length === 0) {
			messageContent = messageTemplate.translation_default_en
		}
		sendTwilioSMS(targetAudience, messageRecipientId, recipientPhoneNumber, messageContent);
}

export const sendTwilioSMS = async (targetAudience: string, messageRecipientId: string, messageRecipientPhone: string, messageContent: string) => {
	const TWILIO_SID = "XXXXXX";
	const TWILIO_TOKEN = "YYYYYY";

	let messageStatus = "failed";
	let messageSid = "unknown";

	const statusCallbackUrl = new URL(CLOUD_FUNCTIONS_URL + '/sendMessagesFunction');

	const client = require('twilio')(TWILIO_SID, TWILIO_TOKEN);
	await client.messages
		.create({
			body: messageContent,
			from: TWILIO_SENDER_PHONE,
			statusCallback: statusCallbackUrl,
			to: messageRecipientPhone
		})
		.then((message: any) => {
			messageStatus = message.status;
			messageSid = message.sid;
		});

	await addMessageInboxItem(
		targetAudience,
		messageRecipientId,
		{
			date: new Date(Date.now()),
			content: messageContent,
			from: TWILIO_SENDER_PHONE,
			to: messageRecipientPhone,
			channel: "SMS",
			twilio_id: messageSid,
			status: messageStatus
		}
	);
};

export const addMessageInboxItem = async (targetAudience: string, messageRecipientId: string, messageInboxItem: MessageInbox) => {
	const firestore = useFirestore();
	firestore
		.collection(`${targetAudience}/${messageRecipientId}/message-inbox`)
		.doc(messageInboxItem.twilio_id)
		.set(messageInboxItem, { merge: true})
		.then(() => console.log(`Message stored for ${messageRecipientId}`))
}