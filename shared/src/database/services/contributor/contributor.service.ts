import { Contributor } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import {
	ContributorPayload,
	ContributorTableView,
	ContributorTableViewRow,
	ContributorUpdateInput,
} from './contributor.types';

export class ContributorService extends BaseService {
	private organizationAccessService = new OrganizationAccessService();

	async get(userId: string, contributorId: string): Promise<ServiceResult<ContributorPayload>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const contributor = await this.db.contributor.findUnique({
				where: {
					id: contributorId,
					contributions: {
						some: {
							campaign: { organizationId: activeOrgResult.data.id },
						},
					},
				},
				select: {
					id: true,
					contact: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							gender: true,
							callingName: true,
							email: true,
							language: true,
							phone: true,
							profession: true,
							dateOfBirth: true,
							address: true,
						},
					},
					referral: true,
					paymentReferenceId: true,
					stripeCustomerId: true,
				},
			});

			if (!contributor) {
				return this.resultFail('Contributor not found');
			}

			return this.resultOk(contributor);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch contributors');
		}
	}

	async update(userId: string, contributor: ContributorUpdateInput): Promise<ServiceResult<Contributor>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const updatedContributor = await this.db.contributor.update({
				where: { id: contributor.id?.toString() },
				data: contributor,
			});

			return this.resultOk(updatedContributor);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch contributors');
		}
	}

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
