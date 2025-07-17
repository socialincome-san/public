import { Payment, PAYMENT_FIRESTORE_PATH } from '@socialincome/shared/src/types/payment';
import { Recipient, RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types/recipient';
import { BaseExtractor } from '../core/base.extractor';

export type RecipientWithId = Recipient & { id: string };

export type PayoutWithRecipient = {
	payout: Payment;
	recipient: RecipientWithId;
};

export class PayoutsExtractor extends BaseExtractor<PayoutWithRecipient> {
	extract = async (): Promise<PayoutWithRecipient[]> => {
		const recipientMap = await this.loadAllRecipients();
		const paymentDocs = await this.loadAllPaymentDocs();
		return this.mergePaymentsWithRecipients(paymentDocs, recipientMap);
	};

	loadAllRecipients = async (): Promise<Map<string, Recipient>> => {
		const snapshot = await this.firestore.collection(RECIPIENT_FIRESTORE_PATH).get();
		const map = new Map<string, Recipient>();
		for (const doc of snapshot.docs) {
			map.set(doc.id, doc.data() as Recipient);
		}
		return map;
	};

	loadAllPaymentDocs = async () => {
		const snapshot = await this.firestore.collectionGroup(PAYMENT_FIRESTORE_PATH).get();
		return snapshot.docs;
	};

	mergePaymentsWithRecipients(
		docs: FirebaseFirestore.QueryDocumentSnapshot[],
		recipientMap: Map<string, Recipient>,
	): PayoutWithRecipient[] {
		const payouts: PayoutWithRecipient[] = [];

		for (const doc of docs) {
			const recipientId = this.extractRecipientIdFromPath(doc.ref.path);
			const recipient = recipientMap.get(recipientId);
			if (!recipient) continue;

			payouts.push({
				payout: doc.data() as Payment,
				recipient: { ...recipient, id: recipientId },
			});
		}

		return payouts;
	}

	// Helper to extract recipientId from Firestore document path
	extractRecipientIdFromPath(path: string): string {
		const parts = path.split('/');
		return parts[parts.indexOf('recipients') + 1];
	}
}
