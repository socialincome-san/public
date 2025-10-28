import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { ContributorTableView, ContributorTableViewRow } from './contributor.types';

export class ContributorService extends BaseService {
	private organizationAccessService = new OrganizationAccessService();

	async getTableView(userId: string): Promise<ServiceResult<ContributorTableView>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId, permission } = activeOrgResult.data;

			const contributors = await this.db.contributor.findMany({
				where: {
					contributions: {
						some: {
							campaign: { organizationId },
						},
					},
				},
				select: {
					id: true,
					createdAt: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							email: true,
							address: { select: { country: true } },
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: ContributorTableViewRow[] = contributors.map((c) => ({
				id: c.id,
				firstName: c.contact?.firstName ?? '',
				lastName: c.contact?.lastName ?? '',
				email: c.contact?.email ?? '',
				country: c.contact?.address?.country ?? null,
				createdAt: c.createdAt,
				permission,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch contributors');
		}
	}
}
