import * as admin from 'firebase-admin';
import firebaseFunctionsTest from 'firebase-functions-test';
import { FirestoreAdmin } from '../../../../shared/src/firebase/FirestoreAdmin';
import { Recipient, RecipientProgramStatus, RECIPIENT_FIRESTORE_PATH } from '../../../../shared/src/types';
import { OrangeMoneyCSVCreator } from '../../../src/etl/OrangeMoneyCSVCreator';
const { cleanup } = firebaseFunctionsTest();

describe('createOrangeMoneyCSV', () => {
	const projectId = 'test' + new Date().getTime();
	const firestoreAdmin = new FirestoreAdmin(admin.initializeApp({ projectId: projectId }));
	const organgeMoneyCsvCreator = new OrangeMoneyCSVCreator(firestoreAdmin);
	afterEach(() => cleanup());

	test('createOrangeMoneyCSV test', async () => {
		const recipientDocs = (
			await firestoreAdmin
				.collection<Recipient>(RECIPIENT_FIRESTORE_PATH)
				.where('progr_status', 'in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated])
				.get()
		).docs;

		const recipients = recipientDocs.map((doc) => doc.data() as Recipient);
		const csv = organgeMoneyCsvCreator.createRecipientsCSV(recipients, new Date(2022, 11, 1, 0));
		expect(csv).toEqual(expectedCSV);
	});

	const expectedCSV = `
Mobile Number*,Amount*,First Name,Last Name,Id Number,Remarks*,User Type*
00000300,400,Daniel,Naba,2,Social Income December 2022,subscriber
00000056,400,Leandro,Pasul,88,Social Income December 2022,subscriber
`.trim();
});
