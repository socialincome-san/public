import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CampaignTableView, CampaignTableViewRow } from './campaign.types';

export class CampaignService extends BaseService {
	async getTableView(userId: string, organizationId: string): Promise<ServiceResult<CampaignTableView>> {
		try {
			const access = await this.db.organizationAccess.findFirst({
				where: {
					userId,
					organizationId,
				},
				select: { id: true },
			});

			if (!access) {
				return this.resultFail('User does not have access to this organization');
			}

			const campaigns = await this.db.campaign.findMany({
				where: {
					organizationId,
				},
				select: {
					id: true,
					title: true,
					creatorName: true,
					creatorEmail: true,
					isActive: true,
					goal: true,
					currency: true,
					endDate: true,
					program: {
						select: {
							name: true,
						},
					},
				},
				orderBy: { endDate: 'desc' },
			});

			const dateFormatter = new Intl.DateTimeFormat('de-CH');

			const tableRows: CampaignTableViewRow[] = campaigns.map((c) => ({
				id: c.id,
				title: c.title,
				creatorName: c.creatorName ?? '',
				creatorEmail: c.creatorEmail ?? '',
				status: c.isActive,
				goal: c.goal ? Number(c.goal) : null,
				currency: c.currency ?? null,
				endDate: c.endDate,
				endDateFormatted: dateFormatter.format(c.endDate),
				programName: c.program?.name ?? null,
			}));

			return this.resultOk({ tableRows });
		} catch {
			return this.resultFail('Could not fetch campaigns for organization');
		}
	}
}
