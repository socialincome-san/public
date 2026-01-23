import { OrganizationPermission, ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { UserService } from '../user/user.service';
import {
	OrganizationMemberTableView,
	OrganizationMemberTableViewRow,
	OrganizationOption,
	OrganizationTableView,
	OrganizationTableViewRow,
} from './organization.types';

export class OrganizationService extends BaseService {
	private userService = new UserService();
	private organizationAccessService = new OrganizationAccessService();

	async getOrganizationMembersTableView(userId: string): Promise<ServiceResult<OrganizationMemberTableView>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId } = activeOrgResult.data;

			const members = await this.db.organizationAccess.findMany({
				where: { organizationId },
				select: {
					user: {
						select: {
							id: true,
							role: true,
							contact: {
								select: {
									firstName: true,
									lastName: true,
									email: true,
								},
							},
						},
					},
					permission: true,
				},
				orderBy: { user: { contact: { firstName: 'asc' } } },
			});

			const tableRows: OrganizationMemberTableViewRow[] = members.map((member) => ({
				id: member.user.id,
				firstName: member.user.contact?.firstName ?? '',
				lastName: member.user.contact?.lastName ?? '',
				email: member.user.contact?.email ?? '',
				role: member.user.role ?? null,
				permission: member.permission ?? OrganizationPermission.readonly,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch organization members: ${JSON.stringify(error)}`);
		}
	}

	async getAdminTableView(userId: string): Promise<ServiceResult<OrganizationTableView>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const organizations = await this.db.organization.findMany({
				select: {
					id: true,
					name: true,
					createdAt: true,
					_count: {
						select: {
							organizationAccesses: true,
						},
					},
					programAccesses: {
						select: {
							permission: true,
						},
					},
				},
				orderBy: { name: 'asc' },
			});

			const tableRows: OrganizationTableViewRow[] = organizations.map((organization) => {
				const ownedProgramsCount = organization.programAccesses.filter(
					(pa) => pa.permission === ProgramPermission.owner,
				).length;

				const operatedProgramsCount = organization.programAccesses.filter(
					(pa) => pa.permission === ProgramPermission.operator,
				).length;

				return {
					id: organization.id,
					name: organization.name,
					ownedProgramsCount,
					operatedProgramsCount,
					usersCount: organization._count.organizationAccesses,
					createdAt: organization.createdAt,
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch organizations: ${JSON.stringify(error)}`);
		}
	}

	async getOptions(userId: string): Promise<ServiceResult<OrganizationOption[]>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const organizations = await this.db.organization.findMany({
				select: { id: true, name: true },
				orderBy: { name: 'asc' },
			});
			return this.resultOk(organizations);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch organizations: ${JSON.stringify(error)}`);
		}
	}
}
