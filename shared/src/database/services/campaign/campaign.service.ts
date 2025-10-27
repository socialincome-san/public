import { OrganizationPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationService } from '../organization/organization.service';
import { CampaignTableView, CampaignTableViewRow } from './campaign.types';

export class CampaignService extends BaseService {
	private organizationService = new OrganizationService();

	async getTableView(userId: string): Promise<ServiceResult<CampaignTableView>> {
		try {
			const activeOrgResult = await this.organizationService.getActiveOrganization(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId, hasEdit } = activeOrgResult.data;

			const campaigns = await this.db.campaign.findMany({
				where: { organizationId },
				select: {
					id: true,
					title: true,
					description: true,
					currency: true,
					endDate: true,
					isActive: true,
					program: { select: { name: true } },
					createdAt: true,
				},
				orderBy: { createdAt: 'desc' },
			});

			const permission = hasEdit ? OrganizationPermission.edit : OrganizationPermission.readonly;

			const tableRows: CampaignTableViewRow[] = campaigns.map((campaign) => ({
				id: campaign.id,
				title: campaign.title,
				description: campaign.description,
				currency: campaign.currency,
				endDate: campaign.endDate,
				isActive: campaign.isActive,
				programName: campaign.program?.name ?? null,
				createdAt: campaign.createdAt,
				permission,
			}));

			return this.resultOk({ tableRows });
		} catch {
			return this.resultFail('Could not fetch campaigns');
		}
	}
}
