import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { ContributionTableView, ContributionTableViewRow } from './contribution.types';

export class ContributionService extends BaseService {
	private organizationAccessService = new OrganizationAccessService();

	async getTableView(userId: string): Promise<ServiceResult<ContributionTableView>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId, permission } = activeOrgResult.data;

			const contributions = await this.db.contribution.findMany({
				where: {
					campaign: {
						organizationId,
					},
				},
				select: {
					id: true,
					createdAt: true,
					amount: true,
					currency: true,
					campaign: {
						select: {
							title: true,
							program: { select: { name: true } },
						},
					},
					contributor: {
						select: {
							contact: {
								select: {
									firstName: true,
									lastName: true,
									email: true,
								},
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: ContributionTableViewRow[] = contributions.map((c) => ({
				id: c.id,
				firstName: c.contributor?.contact?.firstName ?? '',
				lastName: c.contributor?.contact?.lastName ?? '',
				email: c.contributor?.contact?.email ?? '',
				amount: c.amount ? Number(c.amount) : 0,
				currency: c.currency ?? '',
				campaignTitle: c.campaign?.title ?? '',
				programName: c.campaign?.program?.name ?? null,
				createdAt: c.createdAt,
				permission,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch contributions');
		}
	}
}
