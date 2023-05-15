import admin from 'firebase-admin';
import functions from 'firebase-functions-test';
import { FirestoreAdmin } from '../../../../shared/src/firebase/FirestoreAdmin';
import { Entity, MESSAGE_FIRESTORE_PATH, Recipient, RECIPIENT_FIRESTORE_PATH } from '../../../../shared/src/types';
import { twilioOutgoingMessage } from '../../../src';

describe('TwilioOutogingMessageProcessor', () => {
	const projectId = 'test' + new Date().getTime();
	const testEnv = functions({ projectId: projectId });
	const triggerFunction = testEnv.wrap(twilioOutgoingMessage);
	const firestoreAdmin = new FirestoreAdmin(admin.app());

	afterEach(() => testEnv.cleanup());

	test('sending opt-in message', async () => {
		let recipientId = '';
		let recipient: Recipient = {} as Recipient;
		await firestoreAdmin
			.collection(`${RECIPIENT_FIRESTORE_PATH}`)
			.where('progr_status', '==', 'active')
			.where('communication_mobile_phone.has_whatsapp', '==', true)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					const tempRecipient = doc.data() as Recipient;
					if (tempRecipient.communication_mobile_phone.phone) {
						recipientId = doc.id;
						recipient = doc.data() as Recipient;
					}
				});
			})
			.catch((error) => {
				console.log(`No recipient found with ${error}`);
			});

		const recipientEntity: Entity<Recipient> = {
			id: recipientId,
			path: RECIPIENT_FIRESTORE_PATH,
			values: recipient,
		};
		const selectedEntities = [recipientEntity];

		let currentNumberOfMessages = 0;
		await firestoreAdmin
			.collection(`${RECIPIENT_FIRESTORE_PATH}/${recipientId}/${MESSAGE_FIRESTORE_PATH}`)
			.get()
			.then((querySnapshot) => {
				currentNumberOfMessages = querySnapshot.size;
			})
			.catch((error) => {
				console.log(`No messages found with ${error}`);
			});

		await triggerFunction(
			{
				recipients: selectedEntities,
				template: 'opt-in',
			},
			{
				auth: { token: { email: 'admin@socialincome.org' } },
			}
		);

		let sufficientQuerySize = false;
		await firestoreAdmin
			.collection(`${RECIPIENT_FIRESTORE_PATH}/${recipientId}/${MESSAGE_FIRESTORE_PATH}`)
			.get()
			.then((querySnapshot) => {
				if (querySnapshot.size > currentNumberOfMessages) {
					sufficientQuerySize = true;
				}
			})
			.catch((error) => {
				console.log(`No messages found with ${error}`);
			});

		expect(sufficientQuerySize).toEqual(true);
	});
});
