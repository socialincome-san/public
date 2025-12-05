import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccesses } from './program-access.types';

export class ProgramAccessService extends BaseService {
	async getAccessiblePrograms(userId: string): Promise<ServiceResult<ProgramAccesses>> {
		try {
			const user = await this.db.user.findUnique({
				where: { id: userId },
				select: { activeOrganizationId: true },
			});

			if (!user?.activeOrganizationId) {
				return this.resultFail('User has no active organization');
			}

			const orgId = user.activeOrganizationId;

			const accesses = await this.db.programAccess.findMany({
				where: { organizationId: orgId },
				select: {
					programId: true,
					permission: true,
					program: {
						select: { name: true },
					},
				},
			});

			const data: ProgramAccesses = accesses.map((access) => ({
				programId: access.programId,
				programName: access.program.name,
				permission: access.permission,
			}));

			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not fetch program accesses');
		}
	}
}
