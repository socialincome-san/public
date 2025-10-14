import { Payment, PAYMENT_FIRESTORE_PATH } from '@socialincome/shared/src/types/payment';
import { Recipient, RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types/recipient';
import { BaseExtractor } from '../core/base.extractor';

export type FirestoreRecipientWithId = Recipient & { id: string; legacyFirestoreId: string };
export type FirestorePayoutWithRecipient = {
	payout: Payment & { id: string; legacyFirestoreId: string };
	recipient: FirestoreRecipientWithId;
};

export class PayoutExtractor extends BaseExtractor<FirestorePayoutWithRecipient> {
	extract = async (): Promise<FirestorePayoutWithRecipient[]> => {
		const recipients = await this.loadAllRecipients();
		const payouts = await this.loadAllPayouts();
		return this.mergePayoutsWithRecipients(payouts, recipients);
	};

	private async loadAllRecipients(): Promise<Map<string, FirestoreRecipientWithId>> {
		const snapshot = await this.firestore.collection(RECIPIENT_FIRESTORE_PATH).get();
		const map = new Map<string, FirestoreRecipientWithId>();

		for (const doc of snapshot.docs) {
			const data = doc.data() as Recipient;
			map.set(doc.id, { ...data, id: doc.id, legacyFirestoreId: doc.id });
		}

		return map;
	}

	private async loadAllPayouts(): Promise<FirebaseFirestore.QueryDocumentSnapshot<Payment>[]> {
		const snapshot = await this.firestore.collectionGroup(PAYMENT_FIRESTORE_PATH).get();
		return snapshot.docs as FirebaseFirestore.QueryDocumentSnapshot<Payment>[];
	}

	private mergePayoutsWithRecipients(
		docs: FirebaseFirestore.QueryDocumentSnapshot<Payment>[],
		recipientMap: Map<string, FirestoreRecipientWithId>,
	): FirestorePayoutWithRecipient[] {
		const results: FirestorePayoutWithRecipient[] = [];

		for (const doc of docs) {
			const recipientId = this.extractRecipientId(doc.ref.path);
			const recipient = recipientMap.get(recipientId);
			if (!recipient) continue;

			const payoutData = doc.data();
			results.push({
				payout: { ...payoutData, id: doc.id, legacyFirestoreId: doc.id },
				recipient,
			});
		}

		return results;
	}

	private extractRecipientId(path: string): string {
		const parts = path.split('/');
		return parts[parts.indexOf('recipients') + 1];
	}
}
