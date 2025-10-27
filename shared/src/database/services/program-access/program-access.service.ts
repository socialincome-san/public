import { ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { AccessibleProgramsResult } from './program-access.types';

export class ProgramAccessService extends BaseService {
	async getAccessiblePrograms(userId: string): Promise<ServiceResult<AccessibleProgramsResult>> {
		try {
			const accesses = await this.db.programAccess.findMany({
				where: { userId },
				select: {
					programId: true,
					permissions: true,
				},
			});

			const data: AccessibleProgramsResult = accesses.map((access) => ({
				programId: access.programId,
				permission: access.permissions.includes(ProgramPermission.edit)
					? ProgramPermission.edit
					: ProgramPermission.readonly,
			}));

			return this.resultOk(data);
		} catch {
			return this.resultFail('Could not fetch program accesses');
		}
	}
}
