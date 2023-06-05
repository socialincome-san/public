import * as functions from 'firebase-functions';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import {
	MessageType,
	MESSAGE_FIRESTORE_PATH,
	Recipient,
	RECIPIENT_FIRESTORE_PATH,
	TwilioMessage,
} from '../../../shared/src/types';

export class TwilioIncomingMessageHandler {
	readonly firestoreAdmin: FirestoreAdmin;

	constructor(firestoreAdmin: FirestoreAdmin) {
		this.firestoreAdmin = firestoreAdmin;
	}

	defaultWhatsapp = async (WaID: string) => {
		//We can think whether we want to implement a re-try logic, but there is a risk that we pay a lot of money
	};

	optInWhatsapp = async (recipientId: string) => {
		if (recipientId.length > 0) {
			const recipientDocRef = this.firestoreAdmin.doc<Recipient>(`${RECIPIENT_FIRESTORE_PATH}`, recipientId);
			try {
				await recipientDocRef.update({
					'communication_mobile_phone.whatsapp_activated': true,
				});
				console.log('Update successful');
			} catch (error) {
				console.log('Something went wrong with updating ');
			}
		}
	};

	findRecipient = async (WaID: string): Promise<string> => {
		const phoneNumber = parseInt(WaID);
		let recipientId = '';
		await this.firestoreAdmin
			.collection(`${RECIPIENT_FIRESTORE_PATH}`)
			.where('communication_mobile_phone.phone', '==', phoneNumber)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					recipientId = doc.id;
				});
			})
			.catch((error) => {
				console.log(`No recipient found with ${error}`);
			});
		return recipientId;
	};

	/**
	 * For local testing purposes we use ngrok to forward webhooks:
	 * 1. Setup Whatsapp Sandbox in Twilio and activate your personal phone number on https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
	 * 2. Install ngrok on your local machine and make an account on ngrok
	 * 3. Start ngrok locally with ngrok http 5001
	 * 4. Update on https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
	 *    the incoming message field with https://xxxx-yyy-vvv-www-zzz.eu.ngrok.io/social-income-staging/us-central1/twilioIncomingMessage
	 * 5. Send test whatsapp to your personal phone number, by answering the function below is triggered
	 */
	twilioIncomingMessageFunction = functions.https.onRequest(async (request, response) => {
		if (request.body) {
			console.log(request.body);

			const recipientId: string = await this.findRecipient(request.body.WaId);
			console.log(recipientId);

			if (recipientId.length > 0) {
				switch ((request.body.Body as String).toLocaleLowerCase()) {
					case 'yes': {
						await this.optInWhatsapp(recipientId);
						break;
					}
					//TODO: Implement logic to deal with confirmed payments
					/*
                    case "confirmed": {
                        await this.confirmPaymentWhatsapp(recipientId);
                        break;
                    }
                    */
					default: {
						await this.defaultWhatsapp(recipientId);
					}
				}

				const messageCollection = this.firestoreAdmin.collection<TwilioMessage>(
					`${RECIPIENT_FIRESTORE_PATH}/${recipientId}/${MESSAGE_FIRESTORE_PATH}`
				);
				await messageCollection.add({ type: MessageType.WHATSAPP, ...request.body });
			}
		}
		response.send();
	});
}
