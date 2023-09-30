import * as functions from 'firebase-functions';
import { DateTime } from 'luxon';
import { DEFAULT_REGION } from '../../../../../shared/src/firebase';
import { FirestoreAdmin } from '../../../../../shared/src/firebase/admin/FirestoreAdmin';
import { PaymentProcessTaskType } from '../../../../../shared/src/types/Payment';
import { toPaymentDate } from '../../../../../shared/src/types/Recipient';
import { PaymentCSVTask } from './tasks/PaymentCSVTask';
import { PaymentTask } from './tasks/PaymentTask';
import { RegistrationCSVTask } from './tasks/RegistrationCSVTask';
import { SendNotificationsTask } from './tasks/SendNotificationsTask';
import { UpdateDatabaseEntriesTask } from './tasks/UpdateDatabaseEntriesTask';

export interface PaymentProcessProps {
	type: PaymentProcessTaskType;
	timestamp: number; // seconds
}

export default functions
	// Using v1 functions because tests are not supported with v2 yet: https://github.com/firebase/firebase-functions-test/issues/163
	.region(DEFAULT_REGION)
	.https.onCall(async ({ type, timestamp }: PaymentProcessProps, { auth }) => {
		const firestoreAdmin = new FirestoreAdmin();
		await firestoreAdmin.assertGlobalAdmin(auth?.token?.email);
		const paymentDate = toPaymentDate(DateTime.fromSeconds(timestamp, { zone: 'utc' }));
		let task: PaymentTask;

		switch (type) {
			case PaymentProcessTaskType.GetRegistrationCSV:
				task = new RegistrationCSVTask(firestoreAdmin);
				break;
			case PaymentProcessTaskType.GetPaymentCSV:
				task = new PaymentCSVTask(firestoreAdmin);
				break;
			case PaymentProcessTaskType.CreatePayments:
				task = new UpdateDatabaseEntriesTask(firestoreAdmin);
				break;
			case PaymentProcessTaskType.SendNotifications:
				task = new SendNotificationsTask(firestoreAdmin);
				break;
			default:
				throw new functions.https.HttpsError('invalid-argument', 'Invalid AdminPaymentProcessTask');
		}

		return await task.run(paymentDate);
	});
