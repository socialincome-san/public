import { Campaign as PrismaCampaign } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateCampaignInput } from './campaign.types';

export class CampaignService extends BaseService {
	async create(input: CreateCampaignInput): Promise<ServiceResult<PrismaCampaign>> {
		try {
			const campaign = await this.db.campaign.create({
				data: input,
			});
			return this.resultOk(campaign);
		} catch (e) {
			console.error('[CampaignService.create]', e);
			return this.resultFail('Could not create campaign');
		}
	}
}
