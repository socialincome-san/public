import { Recipient as FirestoreRecipient, RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types/recipient';
import { BaseExtractor } from '../core/base.extractor';

export class RecipientsExtractor extends BaseExtractor<FirestoreRecipient> {
	extract = async (): Promise<FirestoreRecipient[]> => {
		return await this.firestore.getAll<FirestoreRecipient>(RECIPIENT_FIRESTORE_PATH);
	};
}
