import * as functions from 'firebase-functions';
import { DateTime } from 'luxon';
import { FirestoreAdmin } from '../../../../../shared/src/firebase/admin/FirestoreAdmin';
import { PaymentProcessTaskType, toPaymentDate } from '../../../../../shared/src/types';
import { CreatePaymentsTask } from './tasks/CreatePaymentsTask';
import { PaymentCSVTask } from './tasks/PaymentCSVTask';
import { PaymentTask } from './tasks/PaymentTask';
import { RegistrationCSVTask } from './tasks/RegistrationCSVTask';
import { SendNotificationsTask } from './tasks/SendNotificationsTask';
import { UpdateRecipientsTask } from './tasks/UpdateRecipientsTask';

export interface PaymentProcessProps {
	type: PaymentProcessTaskType;
	timestamp: number; // seconds
}

export default functions.https.onCall(async ({ type, timestamp }: PaymentProcessProps, { auth }) => {
	const firestoreAdmin = new FirestoreAdmin();
	await firestoreAdmin.assertGlobalAdmin(auth?.token?.email);
	const paymentDate = toPaymentDate(DateTime.fromSeconds(timestamp, { zone: 'utc' }));
	let task: PaymentTask;

	switch (type) {
		case PaymentProcessTaskType.UpdateRecipients:
			task = new UpdateRecipientsTask(firestoreAdmin);
			break;
		case PaymentProcessTaskType.GetRegistrationCSV:
			task = new RegistrationCSVTask(firestoreAdmin);
			break;
		case PaymentProcessTaskType.GetPaymentCSV:
			task = new PaymentCSVTask(firestoreAdmin);
			break;
		case PaymentProcessTaskType.CreatePayments:
			task = new CreatePaymentsTask(firestoreAdmin);
			break;
		case PaymentProcessTaskType.SendNotifications:
			task = new SendNotificationsTask(firestoreAdmin);
			break;
		default:
			throw new functions.https.HttpsError('invalid-argument', 'Invalid AdminPaymentProcessTask');
	}

	return await task.run(paymentDate);
});
