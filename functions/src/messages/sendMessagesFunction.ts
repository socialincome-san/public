import assert from 'assert';
import * as functions from 'firebase-functions';
import _ from 'lodash';
import { doc, useFirestore } from '../../../shared/src/firebase/firestoreAdmin';
import { TWILIO_SENDER_PHONE, CLOUD_FUNCTIONS_URL } from '../config';
import { AdminUser, Entity, User, MessageTemplate, MessageInbox } from '../../../shared/src/types';


export interface SendMessagesFunctionProps {
	users: Entity<User>[];
	contentType: string;
	messageTemplate?: MessageTemplate;
	freeTextContent?: string;
}



export const sendMessagesFunction = functions.https.onCall(
	async ({ users, contentType, messageTemplate, freeTextContent }: SendMessagesFunctionProps, { auth }) => {
		const admin = (await doc<AdminUser>('admins', auth?.token?.email || '').get()).data();
		assert(admin?.is_global_admin);

		let [successCount, skippedCount] = [0, 0];
		
		for (const userEntity of users) {
			const user = userEntity.values;
			try {
				if ( user.personal?.phone) {
					if ( contentType === "template") {
						sendTemplateMessage(userEntity.id, user, messageTemplate as MessageTemplate)
					} else if ( contentType === "freeText") {
						sendFreeTextMessage(userEntity.id, user, freeTextContent as string) 
					} else {
						throw new Error("Message type not found.");
					}
				} else {
					throw new Error('No phone number found for ' + user.personal?.lastname);
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

export const sendTemplateMessage = (userId: string, user: User, messageTemplate: MessageTemplate) => {
	let messageContent = "";
	_.forEach(messageTemplate.translations, function(value, key) {
		if ( key === user.language?.toLowerCase()) {
			messageContent = value
		}
	})
	if ( messageContent.length === 0) {
		messageContent = messageTemplate.translation_default_en
	}
	sendTwilioSMS(userId, user, messageContent);
};


export const sendFreeTextMessage = (userId: string, user: User, freeTextContent: string) => {
	sendTwilioSMS(userId, user, freeTextContent);
}

export const sendTwilioSMS = async (userId: string, user: User, messageContent: string) => {
	const TWILIO_SID = "ACac5dfe59a0af841c6b771835f331fabf";
	const TWILIO_TOKEN = "714a595d0d36d541f1ae2c30c7740308";

	let messageStatus = "failed";
	let messageSid = "unknown";

	const statusCallbackUrl = new URL(CLOUD_FUNCTIONS_URL + '/sendMessagesFunction?userId=' + userId);

	const client = require('twilio')(TWILIO_SID, TWILIO_TOKEN);
	await client.messages
		.create({
			body: messageContent,
			from: TWILIO_SENDER_PHONE,
			statusCallback: statusCallbackUrl,
			to: user.personal?.phone as string
		})
		.then((message: any) => {
			messageStatus = message.status;
			messageSid = message.sid;
			console.log(message);
		});

	await addMessageInboxItem(userId, {
		date: new Date(Date.now()),
		content: messageContent,
		from: TWILIO_SENDER_PHONE,
		to: user.personal?.phone as string,
		channel: "SMS",
		twilio_id: messageSid,
		status: messageStatus
	})

};

export const addMessageInboxItem = async (userId: string, messageInboxItem: MessageInbox) => {
	const firestore = useFirestore();
	firestore
		.collection(`users/${userId}/message-inbox`)
		.doc(messageInboxItem.twilio_id)
		.set(messageInboxItem, { merge: true})
		.then(() => console.log(`Message stored for ${userId}`))
}