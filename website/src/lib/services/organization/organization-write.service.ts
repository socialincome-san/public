import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

type OrganizationPayload = {
	id: string;
	name: string;
};

export class OrganizationWriteService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async createFromEmail(email: string): Promise<ServiceResult<OrganizationPayload>> {
		try {
			const organization = await this.db.organization.create({
				data: {
					name: `${email.toLowerCase().trim()} organization`,
				},
			});

			return this.resultOk({ id: organization.id, name: organization.name });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not create organization');
		}
	}
}
