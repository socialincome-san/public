import * as functions from 'firebase-functions';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { FirestoreAdmin } from '../../../../shared/src/firebase/admin/FirestoreAdmin';
import {
	Entity,
	LocaleLanguage,
	MESSAGE_FIRESTORE_PATH,
	MessageType,
	RECIPIENT_FIRESTORE_PATH,
	Recipient,
	TwilioMessage,
} from '../../../../shared/src/types';
import { sendWhatsapp } from '../../../../shared/src/utils/messaging/whatsapp';
import { TWILIO_SENDER_PHONE, TWILIO_SID, TWILIO_TOKEN } from '../../config';

export interface TwilioOutgoingMessageFunctionProps {
	recipients: Entity<Recipient>[];
	template: 'opt-in';
}

export class TwilioOutgoingMessageHandler {
	private readonly firestoreAdmin: FirestoreAdmin;

	constructor() {
		this.firestoreAdmin = new FirestoreAdmin();
	}

	getFunction = () =>
		functions.https.onCall(async ({ recipients, template }: TwilioOutgoingMessageFunctionProps, { auth }) => {
			await this.firestoreAdmin.assertGlobalAdmin(auth?.token?.email);
			let [successCount, skippedCount] = [0, 0];
			for await (const { values: recipient, id } of recipients) {
				let message: MessageInstance | undefined;
				switch (template) {
					case 'opt-in':
						message = await sendWhatsapp({
							from: TWILIO_SENDER_PHONE,
							to: `+${recipient.communication_mobile_phone?.phone}`,
							twilioConfig: { sid: TWILIO_SID, token: TWILIO_TOKEN },
							templateProps: {
								language: LocaleLanguage.English,
								translationNamespace: 'message-whatsapp-opt-in',
								hbsTemplatePath: 'message/freetext.hbs',
								context: { name: recipient.calling_name ? recipient.calling_name : recipient.first_name },
							},
						});
						break;
					//Here we could add more templates to start a Whatsapp conversation.
					default:
						console.log('Error: Template could not be found');
						skippedCount += 1;
				}

				if (message) {
					const messageCollection = this.firestoreAdmin.collection<TwilioMessage>(
						`${RECIPIENT_FIRESTORE_PATH}/${id}/${MESSAGE_FIRESTORE_PATH}`
					);
					await messageCollection.add({ type: MessageType.WHATSAPP, ...message.toJSON() });
					successCount += 1;
				}
			}
			return `Sent ${successCount} new whatsapp notifications (${skippedCount} failed).`;
		});
}
