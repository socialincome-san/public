import {
	Entity,
	MessageType,
	MESSAGE_FIRESTORE_PATH,
	Recipient,
	RECIPIENT_FIRESTORE_PATH,
	TwilioMessage,
} from '@socialincome/shared/src/types';
import { LocaleLanguage } from '@socialincome/shared/src/types/admin/Language';
import { sendWhatsapp } from '@socialincome/shared/src/utils/messaging/whatsapp';
import * as functions from 'firebase-functions';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { TWILIO_SENDER_PHONE, TWILIO_SID, TWILIO_TOKEN } from '../../config';
import { AbstractFirebaseAdmin, FunctionProvider } from '../../firebase';

export interface TwilioOutgoingMessageFunctionProps {
	recipients: Entity<Recipient>[];
	template: 'opt-in';
}

export class TwilioOutgoingMessageHandler extends AbstractFirebaseAdmin implements FunctionProvider {
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
							to: `+${recipient.communication_mobile_phone.phone}`,
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
