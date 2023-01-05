import { collection } from '@socialincome/shared/src/firebase/firestoreAdmin';
import { Recipient, RecipientProgramStatus, RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import firebaseFunctionsTest from 'firebase-functions-test';
import { createRecipientsCSV } from '../../src/etl/createOrangeMoneyCSV';

const { cleanup } = firebaseFunctionsTest();

describe('createOrangeMoneyCSV', () => {
	afterEach(() => cleanup());

	test('createOrangeMoneyCSV test', async () => {
		const recipientDocs = (
			await collection<Recipient>(RECIPIENT_FIRESTORE_PATH)
				.where('progr_status', 'in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated])
				.get()
		).docs;

		const recipients = recipientDocs.map((doc) => doc.data() as Recipient);
		const csv = createRecipientsCSV(recipients, new Date(2022, 11, 1, 0));
		expect(csv).toEqual(expectedCSV);
	});

	const expectedCSV = `
Mobile Number*,Amount*,First Name,Last Name,Id Number,Remarks*,User Type*
00000300,400,Daniel,Naba,2,Social Income December 2022,subscriber
00000056,400,Leandro,Pasul,88,Social Income December 2022,subscriber
`.trim();
});
