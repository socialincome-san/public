import { firestore } from 'firebase-admin';
import { DateTime } from 'luxon';
import { FirestoreAdmin } from '../../../../../../shared/src/firebase/admin/FirestoreAdmin';
import { Recipient, RECIPIENT_FIRESTORE_PATH, RecipientProgramStatus } from '../../../../../../shared/src/types';
import QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;

export abstract class PaymentTask {
	readonly firestoreAdmin: FirestoreAdmin;

	constructor(firestoreAdmin: FirestoreAdmin) {
		this.firestoreAdmin = firestoreAdmin;
	}

	public async getRecipients(
		allowedStatus: RecipientProgramStatus[] = [RecipientProgramStatus.Active]
	): Promise<QueryDocumentSnapshot<Recipient>[]> {
		return (
			await this.firestoreAdmin
				.collection<Recipient>(RECIPIENT_FIRESTORE_PATH)
				.where('progr_status', 'in', allowedStatus)
				.get()
		).docs.filter((doc) => !doc.get('test_recipient'));
	}

	abstract run(paymentDate: DateTime): Promise<string>;
}
