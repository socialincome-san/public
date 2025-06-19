import {
	PartnerOrganisation as FirestorePartnerOrganisation,
	PARTNER_ORGANISATION_FIRESTORE_PATH,
} from '@socialincome/shared/src/types/partner-organisation';
import { BaseExtractor } from '../core/base.extractor';

export class LocalPartnersExtractor extends BaseExtractor<FirestorePartnerOrganisation> {
	extract = async (): Promise<FirestorePartnerOrganisation[]> => {
		return await this.firestore.getAll<FirestorePartnerOrganisation>(PARTNER_ORGANISATION_FIRESTORE_PATH);
	};
}
