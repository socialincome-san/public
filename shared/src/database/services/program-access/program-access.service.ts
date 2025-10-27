import { ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccesses } from './program-access.types';

export class ProgramAccessService extends BaseService {
	async getAccessiblePrograms(userId: string): Promise<ServiceResult<ProgramAccesses>> {
		try {
			const accesses = await this.db.programAccess.findMany({
				where: { userId },
				select: {
					programId: true,
					permission: true,
				},
			});

			const data: ProgramAccesses = accesses.map((access) => ({
				programId: access.programId,
				permission: access.permission ?? ProgramPermission.readonly,
			}));

			return this.resultOk(data);
		} catch {
			return this.resultFail('Could not fetch program accesses');
		}
	}
}
