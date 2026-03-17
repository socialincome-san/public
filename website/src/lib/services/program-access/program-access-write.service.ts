import { ProgramPermission } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

export class ProgramAccessWriteService extends BaseService {
	async createInitialAccessesForProgram(params: {
		programId: string;
		ownerOrganizationId: string;
		operatorFallbackOrganizationId: string;
	}): Promise<ServiceResult<void>> {
		try {
			await this.db.programAccess.createMany({
				data: [
					{
						programId: params.programId,
						organizationId: params.ownerOrganizationId,
						permission: ProgramPermission.owner,
					},
					{
						programId: params.programId,
						organizationId: params.operatorFallbackOrganizationId,
						permission: ProgramPermission.operator,
					},
				],
			});

			return this.resultOk(undefined);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create program accesses: ${JSON.stringify(error)}`);
		}
	}
}
