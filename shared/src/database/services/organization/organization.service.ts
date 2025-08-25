import { Organization as PrismaOrganization } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserInformation } from '../user/user.types';
import { CreateOrganizationInput, OrganizationTableView, OrganizationTableViewRow } from './organization.types';

export class OrganizationService extends BaseService {
	async create(input: CreateOrganizationInput): Promise<ServiceResult<PrismaOrganization>> {
		try {
			const conflict = await this.checkIfOrganizationExists(input.name);
			if (conflict) {
				return this.resultFail('Organization with this name already exists');
			}

			const organization = await this.db.organization.create({
				data: input,
			});

			return this.resultOk(organization);
		} catch (e) {
			console.error('[OrganizationService.create]', e);
			return this.resultFail('Could not create organization');
		}
	}

	async getOrganizationAdminTableView(user: UserInformation): Promise<ServiceResult<OrganizationTableView>> {
		const accessDenied = this.requireGlobalAnalystOrAdmin<OrganizationTableView>(user);
		if (accessDenied) return accessDenied;

		try {
			const organizations = await this.db.organization.findMany({
				select: {
					id: true,
					name: true,
					_count: {
						select: {
							operatedPrograms: true,
							viewedPrograms: true,
							users: true,
						},
					},
				},
				orderBy: { name: 'asc' },
			});

			const tableRows: OrganizationTableViewRow[] = organizations.map((organization) => ({
				id: organization.id,
				name: organization.name,
				operatedProgramsCount: organization._count.operatedPrograms,
				viewedProgramsCount: organization._count.viewedPrograms,
				usersCount: organization._count.users,
				readonly: user.role === 'globalAnalyst',
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error('[OrganizationService.getOrganizationTableView]', error);
			return this.resultFail('Could not fetch organizations');
		}
	}

	private async checkIfOrganizationExists(name: string): Promise<PrismaOrganization | null> {
		return this.db.organization.findUnique({
			where: { name },
		});
	}
}
