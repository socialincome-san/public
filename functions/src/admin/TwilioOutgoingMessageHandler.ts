import * as functions from 'firebase-functions';
import _ from 'lodash';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import { Translator } from '../../../shared/src/utils/translate';
import { sendWhatsapp } from '../../../shared/src/utils/messaging/whatsapp';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { TWILIO_SENDER_PHONE_WHATSAPP, TWILIO_SID_WHATSAPP, TWILIO_TOKEN_WHATSAPP } from '../config';
import {
	Entity,
	MessageType,
	MESSAGE_FIRESTORE_PATH,
	Recipient,
	RECIPIENT_FIRESTORE_PATH,
	TwilioMessage,
} from '../../../shared/src/types';

export interface TwilioOutgoingMessageFunctionProps {
	recipients: Entity<Recipient>[];
	template: 'opt-in';
}

export class TwilioOutgoingMessageHandler {
	readonly firestoreAdmin: FirestoreAdmin;

	constructor(firestoreAdmin: FirestoreAdmin) {
		this.firestoreAdmin = firestoreAdmin;
	}

	twilioOutgoingMessageFunction = functions.https.onCall(
		async ({ recipients, template }: TwilioOutgoingMessageFunctionProps, { auth }) => {
			await this.firestoreAdmin.assertGlobalAdmin(auth?.token?.email);
			let [successCount, skippedCount] = [0, 0];
			const usersWithFailures = [];
			const translator = await Translator.getInstance({
				language: 'en',
				namespaces: ['template-messages'],
			});
			for await (const recipientEntity of recipients) {
				const recipient = recipientEntity.values;
				let content = '';
				switch (template) {
					case 'opt-in':
						if (recipient.calling_name) {
							content = translator.t('opt-in', { context: { name: recipient.calling_name } });
						} else {
							content = translator.t('opt-in', { context: { name: recipient.first_name } });
						}
						break;
					//Here we could add more templates to start a Whatsapp conversation.
					default:
						console.log('Error: Template could not be found');
						skippedCount += 1;
						usersWithFailures.push(recipientEntity.id);
				}

				if (content.length > 0) {
					const message: MessageInstance = await sendWhatsapp({
						from: TWILIO_SENDER_PHONE_WHATSAPP,
						to: `+${recipient.communication_mobile_phone.phone}`,
						twilioConfig: { sid: TWILIO_SID_WHATSAPP, token: TWILIO_TOKEN_WHATSAPP },
						body: content,
					});
					const messageCollection = this.firestoreAdmin.collection<TwilioMessage>(
						`${RECIPIENT_FIRESTORE_PATH}/${recipientEntity.id}/${MESSAGE_FIRESTORE_PATH}`
					);
					await messageCollection.add({ type: MessageType.SMS, ...message.toJSON() });
					successCount += 1;
				}
			}
			return `Sent ${successCount} new whatsapp notifications (${skippedCount} failed).`;
		}
	);
}
