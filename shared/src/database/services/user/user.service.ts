import { OrganizationPermission, ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationMembersTableView, OrganizationMembersTableViewRow, UserInformation } from './user.types';

export class UserService extends BaseService {
	async getCurrentUserInformation(firebaseAuthUserId: string): Promise<ServiceResult<UserInformation>> {
		try {
			const user = await this.db.user.findFirst({
				where: { account: { firebaseAuthUserId } },
				select: {
					id: true,
					role: true,
					accountId: true,
					contact: { select: { firstName: true, lastName: true } },
					activeOrganization: { select: { id: true, name: true } },
					organizationAccesses: { select: { organization: { select: { id: true, name: true } } } },
					programAccesses: { select: { program: { select: { id: true, name: true } } } },
				},
			});

			if (!user) {
				return this.resultFail('User not found');
			}

			const organizations = user.organizationAccesses.map((access) => ({
				id: access.organization.id,
				name: access.organization.name,
			}));

			const activeOrganization = user.activeOrganization
				? {
						id: user.activeOrganization.id,
						name: user.activeOrganization.name,
					}
				: null;

			const programs = user.programAccesses.map((access) => ({
				id: access.program.id,
				name: access.program.name,
			}));

			const userInfo: UserInformation = {
				id: user.id,
				firstName: user.contact?.firstName ?? null,
				lastName: user.contact?.lastName ?? null,
				role: user.role,
				activeOrganization,
				organizations,
				programs,
			};

			return this.resultOk(userInfo);
		} catch {
			return this.resultFail('Error fetching user information');
		}
	}

	async getOrganizationMembersTableView(
		userId: string,
		organizationId: string,
	): Promise<ServiceResult<OrganizationMembersTableView>> {
		try {
			const access = await this.db.organizationAccess.findFirst({
				where: { userId, organizationId },
				select: { permissions: true },
			});

			if (!access) {
				return this.resultFail('User does not have access to this organization');
			}

			const userPermission = access.permissions.includes(OrganizationPermission.edit)
				? OrganizationPermission.edit
				: OrganizationPermission.readonly;

			const organizationUsers = await this.db.organizationAccess.findMany({
				where: { organizationId },
				select: {
					user: {
						select: {
							id: true,
							contact: { select: { firstName: true, lastName: true } },
						},
					},
					permissions: true,
				},
				orderBy: { user: { id: 'asc' } },
			});

			const tableRows: OrganizationMembersTableViewRow[] = organizationUsers.map((entry) => ({
				id: entry.user.id,
				firstName: entry.user.contact?.firstName ?? '',
				lastName: entry.user.contact?.lastName ?? '',
				permission: entry.permissions.includes(OrganizationPermission.edit)
					? OrganizationPermission.edit
					: OrganizationPermission.readonly,
			}));

			return this.resultOk({ tableRows, userPermission });
		} catch {
			return this.resultFail('Could not fetch organization members');
		}
	}

	async getProgramMembersTableView(
		userId: string,
		programId: string,
	): Promise<ServiceResult<OrganizationMembersTableView>> {
		try {
			const access = await this.db.programAccess.findFirst({
				where: { userId, programId },
				select: { permissions: true },
			});

			if (!access) {
				return this.resultFail('User does not have access to this program');
			}

			const userPermission = access.permissions.includes(ProgramPermission.edit)
				? ProgramPermission.edit
				: ProgramPermission.readonly;

			const programUsers = await this.db.programAccess.findMany({
				where: { programId },
				select: {
					user: {
						select: {
							id: true,
							contact: { select: { firstName: true, lastName: true } },
						},
					},
					permissions: true,
				},
				orderBy: { user: { id: 'asc' } },
			});

			const tableRows: OrganizationMembersTableViewRow[] = programUsers.map((entry) => ({
				id: entry.user.id,
				firstName: entry.user.contact?.firstName ?? '',
				lastName: entry.user.contact?.lastName ?? '',
				permission: entry.permissions.includes(ProgramPermission.edit)
					? ProgramPermission.edit
					: ProgramPermission.readonly,
			}));

			return this.resultOk({ tableRows, userPermission });
		} catch {
			return this.resultFail('Could not fetch program members');
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
