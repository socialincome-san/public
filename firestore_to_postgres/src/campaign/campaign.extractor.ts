import { Campaign, CAMPAIGN_FIRESTORE_PATH } from '@socialincome/shared/src/types/campaign';
import { BaseExtractor } from '../core/base.extractor';

export class CampaignsExtractor extends BaseExtractor<Campaign> {
	extract = async (): Promise<Campaign[]> => {
		return await this.firestore.getAll<Campaign>(CAMPAIGN_FIRESTORE_PATH);
	};
}
