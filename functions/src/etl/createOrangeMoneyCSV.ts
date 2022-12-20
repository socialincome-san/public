import * as functions from 'firebase-functions';
import { useFirestore } from '../../../shared/src/firebase/firestoreAdmin';
import { Recipient, RECIPIENT_FIRESTORE_PATH } from '../../../shared/src/types';

// TODO: make sure only admins or certain users are allowed to call this function!
export const createOrangeMoneyCSVFunction = functions.https.onCall(async () => {
	const firestore = useFirestore();
	const recipientDocs = (await firestore.collection(RECIPIENT_FIRESTORE_PATH).get()).docs;
	const recipients = recipientDocs.map((doc) => doc.data() as Recipient);
	return createRecipientsCSV(recipients, new Date());
});

export const createRecipientsCSV = (recipients: Recipient[], date: Date) => {
	const csvRows = [['Mobile Number*', 'Amount*', 'First Name', 'Last Name', 'Id Number', 'Remarks*', 'User Type*']];
	for (const recipient of recipients) {
		if (['active', 'designated'].includes(recipient.progr_status) && !recipient.test_recipient) {
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
