import { Organization as PrismaOrganization, UserRole } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserInformation } from '../user/user.types';
import { OrganizationTableView, OrganizationTableViewRow } from './organization.types';

export class OrganizationService extends BaseService {
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
							accesses: true, // corresponds to users having access
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

	async checkIfOrganizationExists(name: string): Promise<PrismaOrganization | null> {
		return this.db.organization.findUnique({
			where: { name },
		});
	}
}
