import { Campaign } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { CampaignsCreateInput, CampaignsUpdateInput } from './campaign.types';

export class CampaignWriteService extends BaseService {
	private organizationAccessService = new OrganizationAccessService();

	async create(userId: string, campaign: CampaignsCreateInput): Promise<ServiceResult<Campaign>> {
		const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);

		if (!accessResult.success) {
			return this.resultFail(accessResult.error);
		}

		if (accessResult.data.permission !== 'edit') {
			return this.resultFail('No permissions to create campaign');
		}

		const { id: organizationId } = accessResult.data;

		try {
			const newCampaign = await this.db.campaign.create({
				data: {
					...campaign,
					organization: { connect: { id: organizationId } },
				},
				include: { program: { select: { id: true, name: true } } },
			});
			return this.resultOk(newCampaign);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not create campaign: ${JSON.stringify(error)}`);
		}
	}

	async update(userId: string, campaign: CampaignsUpdateInput): Promise<ServiceResult<Campaign>> {
		const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);

		if (!accessResult.success) {
			return this.resultFail(accessResult.error);
		}

		if (accessResult.data.permission !== 'edit') {
			return this.resultFail('No permissions to create campaign');
		}

		try {
			const updatedCampaign = await this.db.campaign.update({
				where: { id: campaign.id?.toString() },
				data: campaign,
			});

			return this.resultOk(updatedCampaign);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not update campaign: ${JSON.stringify(error)}`);
		}
	}
}
