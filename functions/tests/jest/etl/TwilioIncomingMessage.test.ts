import admin from 'firebase-admin';
import functions from 'firebase-functions-test';
import { FirestoreAdmin } from '../../../../shared/src/firebase/FirestoreAdmin';
import { Recipient, RECIPIENT_FIRESTORE_PATH } from '../../../../shared/src/types';
import { TwilioIncomingMessageHandler } from '../../../src/admin/TwilioIncomingMessageHandler';

describe('TwilioIncomingMessageProcessor', () => {
	const projectId = 'test' + new Date().getTime();
	const testEnv = functions({ projectId: projectId });
	const firestoreAdmin = new FirestoreAdmin(admin.initializeApp({ projectId: projectId }));
	const twilioIncomingMessageHandler = new TwilioIncomingMessageHandler(firestoreAdmin);

	afterEach(() => testEnv.cleanup());

	test('incoming opt-in message', async () => {
		let recipientId = '';
		let recipient: Recipient = {} as Recipient;
		await firestoreAdmin
			.collection(`${RECIPIENT_FIRESTORE_PATH}`)
			.where('progr_status', '==', 'active')
			.where('communication_mobile_phone.whatsapp_activated', '==', false)
			.get()
			.then((querySnapshot) => {
				console.log('Number of docs' + querySnapshot.size);
				querySnapshot.forEach((doc) => {
					console.log(doc.data());
					const tempRecipient = doc.data() as Recipient;
					if (!tempRecipient.communication_mobile_phone.whatsapp_activated) {
						recipientId = doc.id;
						recipient = doc.data() as Recipient;
					}
				});
			})
			.catch((error) => {
				console.log(`No recipient found with ${error}`);
			});

		expect(recipient.communication_mobile_phone.whatsapp_activated).toEqual(false);

		const foundRecipientId = await twilioIncomingMessageHandler.findRecipient(
			recipient.communication_mobile_phone.phone.toString()
		);
		expect(foundRecipientId).toEqual(recipientId);

		//const emptyResponse: Response<any> = {} as Response<any>;
		await twilioIncomingMessageHandler.optInWhatsapp(recipientId);

		const recipientDocRef = firestoreAdmin.doc<Recipient>(`${RECIPIENT_FIRESTORE_PATH}`, recipientId);

		let recipientUpdated = {} as Recipient;

		await recipientDocRef.get().then((doc) => {
			if (doc.exists) {
				recipientUpdated = doc.data() as Recipient;
			} else {
				console.log('Recipient not found!');
			}
		});
		expect(recipientUpdated.communication_mobile_phone.whatsapp_activated).toEqual(true);
	});
});
