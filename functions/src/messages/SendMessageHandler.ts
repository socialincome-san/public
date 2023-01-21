import * as functions from 'firebase-functions';
import { TWILIO_SENDER_PHONE, TWILIO_SID, TWILIO_TOKEN } from '../config';
import { Entity, User, Recipient } from '../../../shared/src/types';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import { sendSms } from '../../../shared/src/utils/messaging/sms';
import { renderTemplate } from '../../../shared/src/utils/templates';

export interface SendMessagesFunctionProps {
	communicationChannel: 'sms' | 'email';
	targetAudience: 'users' | 'recipients';
	messageRecipients: Entity<User | Recipient>[];
	templateParameter: {
		templatePath?: string;
		translationNamespace?: string;
		context: object;
	};
}

export class SendMessageHandler {
	readonly firestoreAdmin: FirestoreAdmin;

	constructor(firestoreAdmin: FirestoreAdmin) {
		this.firestoreAdmin = firestoreAdmin;
	}
	sendMessagesFunction = functions.https.onCall(
		async (
			{
				communicationChannel,
				targetAudience,
				messageRecipients,
				templateParameter: { templatePath, translationNamespace, context },
			}: SendMessagesFunctionProps,
			{ auth }
		) => {
			await this.firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

			let [successCount, skippedCount] = [0, 0];

			if (communicationChannel === 'email') {
				//TODO: Implement email util from Shared
				console.log('Implementation not yet done');
			} else if (communicationChannel === 'sms') {
				[successCount, skippedCount] = await this.sendSmsMessage(targetAudience, messageRecipients, {
					templatePath,
					translationNamespace,
					context,
				});
			}
			return `Successfully sent out ${successCount} messages (${skippedCount} skipped)`;
		}
	);

	sendSmsMessage = async (
		targetAudience: string,
		messageRecipients: Entity<User | Recipient>[],
		templateParameter: {
			templatePath?: string;
			translationNamespace?: string;
			context: object;
		}
	) => {
		let [successCount, skippedCount] = [0, 0];

		let messageRecipientPhone = '';
		let messageRecipientLanguage = '';

		for (const messageRecipientEntity of messageRecipients) {
			try {
				if (targetAudience === 'users') {
					const user = messageRecipientEntity.values as User;
					if (user.personal?.phone && user.language) {
						messageRecipientLanguage = user.language;
						messageRecipientPhone = user.personal.phone;
					} else {
						throw new Error('Either phone number or language missing for ' + messageRecipientEntity.id);
					}
				} else if (targetAudience === 'recipients') {
					const recipient = messageRecipientEntity.values as Recipient;
					if (recipient.mobile_money_phone && recipient.main_language) {
						messageRecipientLanguage = recipient.main_language;
						messageRecipientPhone = '+' + recipient.mobile_money_phone;
					}
				} else {
					throw new Error('User type not supported');
				}

				const content = await renderTemplate({
					language: messageRecipientLanguage,
					translationNamespace: templateParameter.translationNamespace as string,
					hbsTemplatePath: templateParameter.templatePath as string,
					context: templateParameter.context as object,
				});
				const statusCallbackUrl = new URL('https://test.test');

				// messageSid and messageStatus is required to add for Message Inbox
				//const [messageSid, messageStatus] = await sendSms({
				await sendSms({
					messageRecipientPhone: messageRecipientPhone,
					smsServiceId: TWILIO_SID,
					smsServiceSecret: TWILIO_TOKEN,
					statusCallbackUrl: statusCallbackUrl,
					messageSenderPhone: TWILIO_SENDER_PHONE,
					content: content,
				});
				//TODO: Add next section as soon as MessageInbox is activated in FireCMS
				/*
				await addMessageInboxItem(targetAudience, messageRecipientEntity.id, {
					date: new Date(Date.now()),
					content: content,
					from: TWILIO_SENDER_PHONE,
					to: messageRecipientPhone,
					channel: 'SMS',
					twilio_id: messageSid,
					status: messageStatus,
				});
				*/
				successCount += 1;
			} catch (e) {
				skippedCount += 1;
				console.error(e);
			}
		}
		return [successCount, skippedCount];
	};

	//TODO: Function to add Message Inbox
	/*
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
	*/
}
