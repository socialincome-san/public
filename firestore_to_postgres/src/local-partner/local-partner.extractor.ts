import { PARTNER_ORGANISATION_FIRESTORE_PATH } from '@socialincome/shared/src/types/partner-organisation';
import { BaseExtractor } from '../core/base.extractor';
import { FirestoreLocalPartnerWithId } from './local-partner.types';

export class LocalPartnerExtractor extends BaseExtractor<FirestoreLocalPartnerWithId> {
	extract = async (): Promise<FirestoreLocalPartnerWithId[]> => {
		const docs = await this.firestore.getAllWithIds(PARTNER_ORGANISATION_FIRESTORE_PATH);

		return docs.map(({ id, data }) => ({
			...(data as Omit<FirestoreLocalPartnerWithId, 'id'>),
			id,
		}));
	};
}
