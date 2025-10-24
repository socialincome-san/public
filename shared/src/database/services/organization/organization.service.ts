import { UserRole } from '@prisma/client';
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
			}));

			return this.resultOk({ tableRows });
		} catch {
			return this.resultFail('Could not fetch organizations');
		}
	}
}
