import { ProgramPermission } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccesses } from './program-access.types';

export class ProgramAccessReadService extends BaseService {
	private async getActiveOrganizationId(userId: string): Promise<ServiceResult<string>> {
		const user = await this.db.user.findUnique({
			where: { id: userId },
			select: { activeOrganizationId: true },
		});

		if (!user?.activeOrganizationId) {
			return this.resultFail('User has no active organization');
		}

		return this.resultOk(user.activeOrganizationId);
	}

	async getAccessiblePrograms(userId: string): Promise<ServiceResult<ProgramAccesses>> {
		try {
			const activeOrganizationIdResult = await this.getActiveOrganizationId(userId);
			if (!activeOrganizationIdResult.success) {
				return this.resultFail(activeOrganizationIdResult.error);
			}

			const orgId = activeOrganizationIdResult.data;

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

			return this.resultFail(`Could not get accessible programs: ${JSON.stringify(error)}`);
		}
	}

	private resolveEffectivePermission(accesses: ProgramAccesses, programId: string): ProgramPermission | null {
		const programPermissions = accesses
			.filter((access) => access.programId === programId)
			.map((access) => access.permission);
		if (programPermissions.includes(ProgramPermission.operator)) {
			return ProgramPermission.operator;
		}

		if (programPermissions.includes(ProgramPermission.owner)) {
			return ProgramPermission.owner;
		}

		return null;
	}

	async getProgramPermission(userId: string, programId: string): Promise<ServiceResult<ProgramPermission | null>> {
		try {
			const accessibleProgramsResult = await this.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const permission = this.resolveEffectivePermission(accessibleProgramsResult.data, programId);

			return this.resultOk(permission);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not resolve program permission: ${JSON.stringify(error)}`);
		}
	}

	async canReadProgram(userId: string, programId: string): Promise<ServiceResult<boolean>> {
		const permissionResult = await this.getProgramPermission(userId, programId);
		if (!permissionResult.success) {
			return this.resultFail(permissionResult.error);
		}

		return this.resultOk(permissionResult.data !== null);
	}

	async canOperateProgram(userId: string, programId: string): Promise<ServiceResult<boolean>> {
		const permissionResult = await this.getProgramPermission(userId, programId);
		if (!permissionResult.success) {
			return this.resultFail(permissionResult.error);
		}

		return this.resultOk(permissionResult.data === ProgramPermission.operator);
	}
}
