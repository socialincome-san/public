import { OrganizationPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserService } from '../user/user.service';
import {
	ActiveOrganization,
	OrganizationMemberTableView,
	OrganizationMemberTableViewRow,
	OrganizationTableView,
	OrganizationTableViewRow,
} from './organization.types';

export class OrganizationService extends BaseService {
	private userService = new UserService();

	async getActiveOrganization(userId: string): Promise<ServiceResult<ActiveOrganization>> {
		try {
			const user = await this.db.user.findUnique({
				where: { id: userId },
				select: {
					activeOrganizationId: true,
					organizationAccesses: {
						select: {
							organizationId: true,
							permissions: true,
						},
					},
				},
			});

			if (!user?.activeOrganizationId) {
				return this.resultFail('User has no active organization');
			}

			const access = user.organizationAccesses.find((access) => access.organizationId === user.activeOrganizationId);

			const hasEdit = access?.permissions.includes(OrganizationPermission.edit) ?? false;

			return this.resultOk({
				id: user.activeOrganizationId,
				hasEdit,
			});
		} catch {
			return this.resultFail('Could not fetch active organization');
		}
	}

	async getOrganizationMembersTableView(userId: string): Promise<ServiceResult<OrganizationMemberTableView>> {
		try {
			const activeOrgResult = await this.getActiveOrganization(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId, hasEdit } = activeOrgResult.data;

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
					permissions: true,
				},
				orderBy: { user: { contact: { firstName: 'asc' } } },
			});

			const tableRows: OrganizationMemberTableViewRow[] = members.map((member) => ({
				id: member.user.id,
				firstName: member.user.contact?.firstName ?? '',
				lastName: member.user.contact?.lastName ?? '',
				email: member.user.contact?.email ?? '',
				role: member.user.role ?? null,
				permission: hasEdit ? OrganizationPermission.edit : OrganizationPermission.readonly,
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

			if (!isAdminResult.data) {
				return this.resultOk({ tableRows: [] });
			}

			const organizations = await this.db.organization.findMany({
				select: {
					id: true,
					name: true,
					createdAt: true,
					_count: {
						select: {
							ownedPrograms: true,
							accesses: true,
						},
					},
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
}
