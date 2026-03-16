import { Currency, PrismaClient, ProgramPermission } from '@/generated/prisma/client';
import { getCountryNameByCode } from '@/lib/types/country';
import { logger } from '@/lib/utils/logger';
import { now } from '@/lib/utils/now';
import { CandidateWriteService } from '../candidate/candidate-write.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { ProgramAccessWriteService } from '../program-access/program-access-write.service';
import { ProgramValidationService } from './program-validation.service';
import { CreateProgramInput, ProgramSettingsUpdateInput } from './program.types';

export class ProgramWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly programAccessReadService: ProgramAccessReadService,
		private readonly programAccessService: ProgramAccessWriteService,
		private readonly candidateService: CandidateWriteService,
		private readonly programValidationService: ProgramValidationService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async create(userId: string, input: CreateProgramInput): Promise<ServiceResult<{ programId: string }>> {
		try {
			const user = await this.db.user.findUnique({
				where: { id: userId },
				select: { activeOrganizationId: true },
			});

			if (!user?.activeOrganizationId) {
				return this.resultFail('User has no active organization');
			}

			const operatorFallbackOrg = await this.db.organization.findFirst({
				where: { isOperatorFallback: true },
				select: { id: true },
			});

			if (!operatorFallbackOrg) {
				return this.resultFail('Operator fallback organization not found');
			}

			const country = await this.db.country.findUnique({
				where: { id: input.countryId },
				select: { isoCode: true },
			});

			if (!country) {
				return this.resultFail('Country not found');
			}

			const program = await this.db.program.create({
				data: {
					name: `${getCountryNameByCode(country.isoCode)} Program ${Math.floor(10000 + Math.random() * 90000)}`,
					countryId: input.countryId,
					amountOfRecipientsForStart: input.amountOfRecipientsForStart ?? null,
					coveredByReserves: false,
					programDurationInMonths: input.programDurationInMonths,
					payoutPerInterval: input.payoutPerInterval,
					payoutInterval: input.payoutInterval,
					targetCauses: input.targetCauses,
					targetProfiles: input.targetProfiles,
				},
			});

			const defaultCampaignEndDate = now();
			defaultCampaignEndDate.setFullYear(defaultCampaignEndDate.getFullYear() + 10);

			await this.db.campaign.create({
				data: {
					title: `${program.name} - Default Campaign`,
					description: `Default active campaign for ${program.name}.`,
					currency: Currency.CHF,
					endDate: defaultCampaignEndDate,
					isActive: true,
					program: { connect: { id: program.id } },
					organization: { connect: { id: user.activeOrganizationId } },
				},
			});

			const accessResult = await this.programAccessService.createInitialAccessesForProgram({
				programId: program.id,
				ownerOrganizationId: user.activeOrganizationId,
				operatorFallbackOrganizationId: operatorFallbackOrg.id,
			});

			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			if (input.amountOfRecipientsForStart > 0) {
				const assignResult = await this.candidateService.assignRandomCandidatesToProgram(
					program.id,
					input.amountOfRecipientsForStart,
					country.isoCode,
					input.targetCauses,
					input.targetProfiles,
				);

				if (!assignResult.success) {
					return this.resultFail(assignResult.error);
				}
			}

			return this.resultOk({ programId: program.id });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create program: ${JSON.stringify(error)}`);
		}
	}

	async updateSettings(userId: string, input: ProgramSettingsUpdateInput): Promise<ServiceResult<{ id: string }>> {
		try {
			const parsedInputResult = this.programValidationService.validateSettingsUpdateInput(input);
			if (!parsedInputResult.success) {
				return this.resultFail(parsedInputResult.error);
			}
			const parsedInput = parsedInputResult.data;
			const uniquenessResult = await this.programValidationService.validateUpdateUniqueness(parsedInput);
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const accessibleProgramsResult = await this.programAccessReadService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const hasOperatorAccess = accessibleProgramsResult.data.some(
				(program) => program.programId === parsedInput.id && program.permission === ProgramPermission.operator,
			);
			if (!hasOperatorAccess) {
				return this.resultFail('Permission denied');
			}

			const existingProgram = await this.db.program.findUnique({
				where: { id: parsedInput.id },
				select: { id: true },
			});
			if (!existingProgram) {
				return this.resultFail('Program not found');
			}

			const existingCountry = await this.db.country.findUnique({
				where: { id: parsedInput.countryId },
				select: { id: true },
			});
			if (!existingCountry) {
				return this.resultFail('Country not found');
			}

			const ownerOrganizationIds = Array.from(new Set(parsedInput.ownerOrganizationIds));
			const operatorOrganizationIds = Array.from(new Set(parsedInput.operatorOrganizationIds));
			const organizationIdsToValidate = Array.from(new Set([...ownerOrganizationIds, ...operatorOrganizationIds]));
			const existingOrganizations = await this.db.organization.findMany({
				where: { id: { in: organizationIdsToValidate } },
				select: { id: true },
			});
			if (existingOrganizations.length !== organizationIdsToValidate.length) {
				return this.resultFail('One or more selected organizations do not exist.');
			}

			const programAccessesToCreate = [
				...ownerOrganizationIds.map((organizationId) => ({
					programId: parsedInput.id,
					organizationId,
					permission: ProgramPermission.owner,
				})),
				...operatorOrganizationIds.map((organizationId) => ({
					programId: parsedInput.id,
					organizationId,
					permission: ProgramPermission.operator,
				})),
			];

			await this.db.$transaction(async (tx) => {
				await tx.program.update({
					where: { id: parsedInput.id },
					data: {
						name: parsedInput.name,
						countryId: parsedInput.countryId,
						coveredByReserves: parsedInput.coveredByReserves,
						programDurationInMonths: parsedInput.programDurationInMonths,
						payoutPerInterval: parsedInput.payoutPerInterval,
						payoutInterval: parsedInput.payoutInterval,
						targetCauses: parsedInput.targetCauses,
						targetProfiles: parsedInput.targetProfiles,
					},
				});

				await tx.programAccess.deleteMany({
					where: {
						programId: parsedInput.id,
						permission: { in: [ProgramPermission.owner, ProgramPermission.operator] },
					},
				});

				if (programAccessesToCreate.length > 0) {
					await tx.programAccess.createMany({ data: programAccessesToCreate });
				}
			});

			return this.resultOk({ id: parsedInput.id });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not update program settings: ${JSON.stringify(error)}`);
		}
	}

	async delete(userId: string, programId: string): Promise<ServiceResult<void>> {
		try {
			const accessibleProgramsResult = await this.programAccessReadService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const hasOperatorAccess = accessibleProgramsResult.data.some(
				(program) => program.programId === programId && program.permission === ProgramPermission.operator,
			);
			if (!hasOperatorAccess) {
				return this.resultFail('Permission denied');
			}

			const existingProgram = await this.db.program.findUnique({
				where: { id: programId },
				select: { id: true },
			});
			if (!existingProgram) {
				return this.resultFail('Program not found');
			}

			const payoutExists = await this.db.payout.findFirst({
				where: {
					recipient: {
						programId,
					},
				},
				select: { id: true },
			});
			if (payoutExists) {
				return this.resultFail('Program cannot be deleted because recipients already have payouts.');
			}

			const contributionExists = await this.db.contribution.findFirst({
				where: {
					campaign: {
						programId,
					},
				},
				select: { id: true },
			});
			if (contributionExists) {
				return this.resultFail('Program cannot be deleted because related campaigns already have contributions.');
			}

			await this.db.$transaction(async (tx) => {
				await tx.recipient.updateMany({
					where: { programId },
					data: { programId: null },
				});

				await tx.survey.updateMany({
					where: {
						surveySchedule: {
							programId,
						},
					},
					data: { surveyScheduleId: null },
				});

				await tx.campaign.deleteMany({
					where: { programId },
				});

				await tx.surveySchedule.deleteMany({
					where: { programId },
				});

				await tx.programAccess.deleteMany({
					where: { programId },
				});

				await tx.program.delete({
					where: { id: programId },
				});
			});

			return this.resultOk(undefined);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not delete program: ${JSON.stringify(error)}`);
		}
	}
}
