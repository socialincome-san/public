import * as functions from 'firebase-functions';
import sortBy from 'lodash/sortBy';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import { Recipient, RecipientProgramStatus, RECIPIENT_FIRESTORE_PATH } from '../../../shared/src/types';

export class OrangeMoneyCSVCreator {
	readonly firestoreAdmin: FirestoreAdmin;

	constructor(firestoreAdmin: FirestoreAdmin) {
		this.firestoreAdmin = firestoreAdmin;
	}

	createOrangeMoneyCSV = functions.https.onCall(async (_, { auth }) => {
		await this.firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

		const recipientDocs = (
			await this.firestoreAdmin
				.collection<Recipient>(RECIPIENT_FIRESTORE_PATH)
				.where('progr_status', 'in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated])
				.get()
		).docs;

		const recipients = recipientDocs.map((doc) => doc.data() as Recipient);
		const recipientsSorted = sortBy(recipients, (r) => r.om_uid);
		return this.createRecipientsCSV(recipientsSorted, new Date());
	});

	createRecipientsCSV = (recipients: Recipient[], date: Date) => {
		const csvRows = [['Mobile Number*', 'Amount*', 'First Name', 'Last Name', 'Id Number', 'Remarks*', 'User Type*']];
		for (const recipient of recipients) {
			// Can't be filtered out in query because firestore can't filter on non-existent fields
			if (!recipient.test_recipient) {
				csvRows.push([
					recipient.mobile_money_phone.phone.toString().slice(-8),
					'400',
					recipient.first_name,
					recipient.last_name,
					recipient.om_uid.toString(),
					`Social Income ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
					'subscriber',
				]);
			}
		}
		return csvRows.map((row) => row.join(',')).join('\n');
	};
}
