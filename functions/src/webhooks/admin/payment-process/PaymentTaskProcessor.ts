import { firestore } from 'firebase-admin';
import * as functions from 'firebase-functions';
import { DateTime } from 'luxon';
import {
	PaymentProcessTaskType,
	Recipient,
	RecipientProgramStatus,
	RECIPIENT_FIRESTORE_PATH,
} from '../../../../../shared/src/types';
import { ExchangeRateImporter } from '../../../cron/ExchangeRateImporter';
import { AbstractFirebaseAdmin, FunctionProvider } from '../../../firebase';
import { CreateNewPaymentsTask } from './tasks/CreateNewPaymentsTask';
import { PaymentCSVTask } from './tasks/PaymentCSVTask';
import { RegistrationCSVTask } from './tasks/RegistrationCSVTask';
import { SendNotificationsTask } from './tasks/SendNotificationsTask';
import QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;

export interface PaymentTask {
	run(): Promise<string>;
}

interface PaymentProcessTakProps {
	type: PaymentProcessTaskType;
	timestamp: number; // seconds
}

export class PaymentTaskProcessor extends AbstractFirebaseAdmin implements FunctionProvider {
	getRecipients = async (): Promise<QueryDocumentSnapshot<Recipient>[]> => {
		return (
			await this.firestoreAdmin
				.collection<Recipient>(RECIPIENT_FIRESTORE_PATH)
				.where('progr_status', 'in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated])
				.orderBy('om_uid')
				.get()
		).docs;
	};

	getFunction = () =>
		functions.https.onCall(async ({ type, timestamp }: PaymentProcessTakProps, { auth }) => {
			await this.firestoreAdmin.assertGlobalAdmin(auth?.token?.email);
			const recipients = await this.getRecipients();
			const dt = DateTime.fromSeconds(timestamp);

			let task: PaymentTask;
			switch (type) {
				case PaymentProcessTaskType.GetRegistrationCSV:
					task = new RegistrationCSVTask(recipients);
					break;
				case PaymentProcessTaskType.GetPaymentCSV:
					task = new PaymentCSVTask(recipients);
					break;
				case PaymentProcessTaskType.CreateNewPayments:
					const exchangeRates = await new ExchangeRateImporter().getExchangeRates(dt);
					task = new CreateNewPaymentsTask(recipients, exchangeRates, this.firestoreAdmin);
					break;
				case PaymentProcessTaskType.SendNotifications:
					task = new SendNotificationsTask(recipients, this.firestoreAdmin);
					break;
				default:
					throw new functions.https.HttpsError('invalid-argument', 'Invalid AdminPaymentProcessTask');
			}

			return await task.run();
		});
}
