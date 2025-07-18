import { Organization as PrismaOrganization } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateOrganizationInput } from './organization.types';

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

	private async checkIfOrganizationExists(name: string): Promise<PrismaOrganization | null> {
		return this.db.organization.findUnique({
			where: { name },
		});
	}
}
