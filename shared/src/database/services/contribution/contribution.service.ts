import { OrganizationPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationService } from '../organization/organization.service';
import { ContributionTableView, ContributionTableViewRow } from './contribution.types';

export class ContributionService extends BaseService {
	private organizationService = new OrganizationService();

	async getTableView(userId: string): Promise<ServiceResult<ContributionTableView>> {
		try {
			const activeOrgResult = await this.organizationService.getActiveOrganization(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId, hasEdit } = activeOrgResult.data;

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

			const permission = hasEdit ? OrganizationPermission.edit : OrganizationPermission.readonly;

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
		} catch {
			return this.resultFail('Could not fetch contributions');
		}
	}
}
