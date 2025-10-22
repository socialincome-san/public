import { UserRole } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserInformation } from '../user/user.types';
import { OrganizationInformation, OrganizationTableView, OrganizationTableViewRow } from './organization.types';

export class OrganizationService extends BaseService {
	async getOrganizationInformation(
		userId: string,
		organizationId: string,
	): Promise<ServiceResult<OrganizationInformation>> {
		try {
			const access = await this.db.organizationAccess.findUnique({
				where: {
					userId_organizationId: { userId, organizationId },
				},
				select: {
					organization: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			if (!access) {
				return this.resultFail('User does not have access to this organization');
			}

			return this.resultOk(access.organization);
		} catch (error) {
			return this.resultFail('Could not fetch organization');
		}
	}

	async getOrganizationAdminTableView(user: UserInformation): Promise<ServiceResult<OrganizationTableView>> {
		if (user.role !== UserRole.admin) {
			return this.resultOk({ tableRows: [] });
		}

		try {
			const organizations = await this.db.organization.findMany({
				select: {
					id: true,
					name: true,
					_count: {
						select: {
							operatedPrograms: true,
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
				operatedProgramsCount: organization._count.operatedPrograms,
				ownedProgramsCount: organization._count.ownedPrograms,
				usersCount: organization._count.accesses,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			return this.resultFail('Could not fetch organizations');
		}
	}
}
