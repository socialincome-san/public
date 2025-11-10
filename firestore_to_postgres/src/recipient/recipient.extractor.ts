import { RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types/recipient';
import { BaseExtractor } from '../core/base.extractor';
import { FirestoreRecipientWithId } from './recipient.types';

export class RecipientExtractor extends BaseExtractor<FirestoreRecipientWithId> {
	extract = async (): Promise<FirestoreRecipientWithId[]> => {
		const docs = await this.firestore.getAllWithIds(RECIPIENT_FIRESTORE_PATH);

		return docs.map(({ id, data }) => ({
			...(data as Omit<FirestoreRecipientWithId, 'id'>),
			id,
		}));
	};
}
