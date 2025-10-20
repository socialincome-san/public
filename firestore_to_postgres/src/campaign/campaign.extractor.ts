import { CAMPAIGN_FIRESTORE_PATH } from '@socialincome/shared/src/types/campaign';
import { BaseExtractor } from '../core/base.extractor';
import { FirestoreCampaignWithId } from './campaign.types';

export class CampaignExtractor extends BaseExtractor<FirestoreCampaignWithId> {
	extract = async (): Promise<FirestoreCampaignWithId[]> => {
		const docs = await this.firestore.getAllWithIds(CAMPAIGN_FIRESTORE_PATH);

		return docs.map(({ id, data }) => ({
			...(data as Omit<FirestoreCampaignWithId, 'id'>),
			id,
		}));
	};
}
