import { OrganizationPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { UserService } from '../user/user.service';
import {
	OrganizationMemberTableView,
	OrganizationMemberTableViewRow,
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
		} catch {
			return this.resultFail('Could not fetch organization members');
		}
	}

	async getAdminTableView(userId: string): Promise<ServiceResult<OrganizationTableView>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const isAdmin = isAdminResult.data.isAdmin;
			if (!isAdmin) {
				return this.resultOk({ tableRows: [] });
			}

			const organizations = await this.db.organization.findMany({
				select: {
					id: true,
					name: true,
					_count: {
						select: {
							ownedPrograms: true,
							accesses: true,
						},
					},
					createdAt: true,
				},
				orderBy: { name: 'asc' },
			});

			const tableRows: OrganizationTableViewRow[] = organizations.map((organization) => ({
				id: organization.id,
				name: organization.name,
				ownedProgramsCount: organization._count.ownedPrograms,
				usersCount: organization._count.accesses,
				createdAt: organization.createdAt,
			}));

			return this.resultOk({ tableRows });
		} catch {
			return this.resultFail('Could not fetch organizations');
		}
	}

	async setActiveOrganization(userId: string, organizationId: string): Promise<ServiceResult<null>> {
		try {
			const hasAccess = await this.db.organizationAccess.findFirst({
				where: { userId, organizationId },
				select: { id: true },
			});

			if (!hasAccess) {
				return this.resultFail('User does not have access to this organization');
			}

			await this.db.user.update({
				where: { id: userId },
				data: { activeOrganizationId: organizationId },
			});

			return this.resultOk(null);
		} catch {
			return this.resultFail('Could not set active organization');
		}
	}
}
