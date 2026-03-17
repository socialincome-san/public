import { OrganizationPermission, PrismaClient, ProgramPermission } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import { OrganizationFormCreateInput, OrganizationFormUpdateInput } from './organization-form-input';
import { OrganizationValidationService } from './organization-validation.service';
import { OrganizationPayload } from './organization.types';

const buildOrganizationAccessRows = (
	organizationId: string,
	editUserIds: string[],
	readonlyUserIds: string[],
): { organizationId: string; userId: string; permission: OrganizationPermission }[] => {
	const uniqueEditUserIds = Array.from(new Set(editUserIds));
	const uniqueReadonlyUserIds = Array.from(new Set(readonlyUserIds)).filter((userId) => !uniqueEditUserIds.includes(userId));

	return [
		...uniqueEditUserIds.map((userId) => ({
			organizationId,
			userId,
			permission: OrganizationPermission.edit,
		})),
		...uniqueReadonlyUserIds.map((userId) => ({
			organizationId,
			userId,
			permission: OrganizationPermission.readonly,
		})),
	];
};

const buildProgramAccessRows = (
	organizationId: string,
	ownedProgramIds: string[],
	operatedProgramIds: string[],
): { organizationId: string; programId: string; permission: ProgramPermission }[] => {
	const uniqueOwnedProgramIds = Array.from(new Set(ownedProgramIds));
	const uniqueOperatedProgramIds = Array.from(new Set(operatedProgramIds));

	return [
		...uniqueOwnedProgramIds.map((programId) => ({
			organizationId,
			programId,
			permission: ProgramPermission.owner,
		})),
		...uniqueOperatedProgramIds.map((programId) => ({
			organizationId,
			programId,
			permission: ProgramPermission.operator,
		})),
	];
};

export class OrganizationWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		private readonly organizationValidationService: OrganizationValidationService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private async validateUserIds(userIds: string[]): Promise<ServiceResult<void>> {
		const uniqueUserIds = Array.from(new Set(userIds));
		if (uniqueUserIds.length === 0) {
			return this.resultOk(undefined);
		}

		const users = await this.db.user.findMany({
			where: { id: { in: uniqueUserIds } },
			select: { id: true },
		});
		if (users.length !== uniqueUserIds.length) {
			return this.resultFail('One or more selected users do not exist.');
		}

		return this.resultOk(undefined);
	}

	private async validateProgramIds(programIds: string[]): Promise<ServiceResult<void>> {
		const uniqueProgramIds = Array.from(new Set(programIds));
		if (uniqueProgramIds.length === 0) {
			return this.resultOk(undefined);
		}

		const programs = await this.db.program.findMany({
			where: { id: { in: uniqueProgramIds } },
			select: { id: true },
		});
		if (programs.length !== uniqueProgramIds.length) {
			return this.resultFail('One or more selected programs do not exist.');
		}

		return this.resultOk(undefined);
	}

	async create(userId: string, input: OrganizationFormCreateInput): Promise<ServiceResult<OrganizationPayload>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const validatedInputResult = this.organizationValidationService.validateCreateInput(input);
			if (!validatedInputResult.success) {
				return this.resultFail(validatedInputResult.error);
			}
			const validatedInput = validatedInputResult.data;

			const uniquenessResult = await this.organizationValidationService.validateCreateUniqueness(validatedInput);
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const allUserIds = [...validatedInput.editUserIds, ...validatedInput.readonlyUserIds];
			const userValidationResult = await this.validateUserIds(allUserIds);
			if (!userValidationResult.success) {
				return this.resultFail(userValidationResult.error);
			}
			const allProgramIds = [...validatedInput.ownedProgramIds, ...validatedInput.operatedProgramIds];
			const programValidationResult = await this.validateProgramIds(allProgramIds);
			if (!programValidationResult.success) {
				return this.resultFail(programValidationResult.error);
			}

			const created = await this.db.$transaction(async (tx) => {
				const organization = await tx.organization.create({
					data: {
						name: validatedInput.name,
					},
					select: {
						id: true,
						name: true,
					},
				});

				const accesses = buildOrganizationAccessRows(
					organization.id,
					validatedInput.editUserIds,
					validatedInput.readonlyUserIds,
				);
				if (accesses.length > 0) {
					await tx.organizationAccess.createMany({ data: accesses });
				}

				const programAccesses = buildProgramAccessRows(
					organization.id,
					validatedInput.ownedProgramIds,
					validatedInput.operatedProgramIds,
				);
				if (programAccesses.length > 0) {
					await tx.programAccess.createMany({ data: programAccesses });
				}

				return organization;
			});

			return this.resultOk({
				id: created.id,
				name: created.name,
				editUserIds: validatedInput.editUserIds,
				readonlyUserIds: validatedInput.readonlyUserIds,
				ownedProgramIds: validatedInput.ownedProgramIds,
				operatedProgramIds: validatedInput.operatedProgramIds,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not create organization. Please try again later.');
		}
	}

	async update(userId: string, input: OrganizationFormUpdateInput): Promise<ServiceResult<OrganizationPayload>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const validatedInputResult = this.organizationValidationService.validateUpdateInput(input);
			if (!validatedInputResult.success) {
				return this.resultFail(validatedInputResult.error);
			}
			const validatedInput = validatedInputResult.data;

			const existing = await this.db.organization.findUnique({
				where: { id: validatedInput.id },
				select: { id: true, name: true },
			});
			if (!existing) {
				return this.resultFail('Organization not found');
			}

			const uniquenessResult = await this.organizationValidationService.validateUpdateUniqueness(validatedInput, {
				organizationId: existing.id,
				existingName: existing.name,
			});
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const allUserIds = [...validatedInput.editUserIds, ...validatedInput.readonlyUserIds];
			const userValidationResult = await this.validateUserIds(allUserIds);
			if (!userValidationResult.success) {
				return this.resultFail(userValidationResult.error);
			}
			const allProgramIds = [...validatedInput.ownedProgramIds, ...validatedInput.operatedProgramIds];
			const programValidationResult = await this.validateProgramIds(allProgramIds);
			if (!programValidationResult.success) {
				return this.resultFail(programValidationResult.error);
			}

			const updated = await this.db.$transaction(async (tx) => {
				const organization = await tx.organization.update({
					where: { id: validatedInput.id },
					data: { name: validatedInput.name },
					select: { id: true, name: true },
				});

				await tx.organizationAccess.deleteMany({
					where: { organizationId: validatedInput.id },
				});

				const accesses = buildOrganizationAccessRows(
					validatedInput.id,
					validatedInput.editUserIds,
					validatedInput.readonlyUserIds,
				);
				if (accesses.length > 0) {
					await tx.organizationAccess.createMany({ data: accesses });
				}

				await tx.programAccess.deleteMany({
					where: { organizationId: validatedInput.id },
				});

				const programAccesses = buildProgramAccessRows(
					validatedInput.id,
					validatedInput.ownedProgramIds,
					validatedInput.operatedProgramIds,
				);
				if (programAccesses.length > 0) {
					await tx.programAccess.createMany({ data: programAccesses });
				}

				return organization;
			});

			return this.resultOk({
				id: updated.id,
				name: updated.name,
				editUserIds: validatedInput.editUserIds,
				readonlyUserIds: validatedInput.readonlyUserIds,
				ownedProgramIds: validatedInput.ownedProgramIds,
				operatedProgramIds: validatedInput.operatedProgramIds,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not update organization. Please try again later.');
		}
	}

	async delete(userId: string, organizationId: string): Promise<ServiceResult<void>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const existing = await this.db.organization.findUnique({
				where: { id: organizationId },
				select: { id: true },
			});
			if (!existing) {
				return this.resultFail('Organization not found');
			}

			const [activeUsersCount, expensesCount, campaignsCount, programAccessesCount] = await Promise.all([
				this.db.user.count({ where: { activeOrganizationId: organizationId } }),
				this.db.expense.count({ where: { organizationId } }),
				this.db.campaign.count({ where: { organizationId } }),
				this.db.programAccess.count({ where: { organizationId } }),
			]);

			if (activeUsersCount > 0 || expensesCount > 0 || campaignsCount > 0 || programAccessesCount > 0) {
				return this.resultFail('Organization cannot be deleted because it is still in use.');
			}

			await this.db.$transaction(async (tx) => {
				await tx.organizationAccess.deleteMany({
					where: { organizationId },
				});
				await tx.organization.delete({
					where: { id: organizationId },
				});
			});

			return this.resultOk(undefined);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not delete organization. Please try again later.');
		}
	}
}
