import { PayoutStatus, ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessService } from '../program-access/program-access.service';
import { CreateProgramInput, ProgramOption, ProgramWallet, ProgramWallets } from './program.types';

export class ProgramService extends BaseService {
	private programAccessService = new ProgramAccessService();

	async getProgramWallets(userId: string): Promise<ServiceResult<ProgramWallets>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);

			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const accessiblePrograms = accessibleProgramsResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultOk({ wallets: [] });
			}

			const programIds = accessiblePrograms.map((p) => p.programId);

			const programs = await this.db.program.findMany({
				where: { id: { in: programIds } },
				select: {
					id: true,
					name: true,
					country: {
						select: { name: true },
					},
					payoutCurrency: true,
					recipients: {
						select: {
							payouts: {
								where: { status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] } },
								select: { amount: true },
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			const wallets: ProgramWallet[] = programs.map((program) => {
				const permission = accessiblePrograms.some(
					(a) => a.programId === program.id && a.permission === ProgramPermission.operator,
				)
					? ProgramPermission.operator
					: ProgramPermission.owner;

				const recipientsCount = program.recipients.length;

				let totalPayoutsSum = 0;
				for (const recipient of program.recipients) {
					for (const payout of recipient.payouts) {
						totalPayoutsSum += Number(payout.amount ?? 0);
					}
				}

				return {
					id: program.id,
					programName: program.name,
					country: program.country.name,
					payoutCurrency: program.payoutCurrency,
					recipientsCount,
					totalPayoutsSum,
					permission,
				};
			});

			return this.resultOk({ wallets });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not fetch programs');
		}
	}

	async getProgramWalletsProgramScoped(userId: string, programId: string): Promise<ServiceResult<ProgramWallet>> {
		const base = await this.getProgramWallets(userId);

		if (!base.success) {
			return this.resultFail(base.error);
		}

		const wallet = base.data.wallets.find((w) => w.id === programId);

		if (!wallet) {
			return this.resultFail('Program not found or not accessible');
		}

		return this.resultOk(wallet);
	}

	async getOptions(userId: string): Promise<ServiceResult<ProgramOption[]>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);

			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const programs = accessibleProgramsResult.data.map((p) => ({
				id: p.programId,
				name: p.programName,
			}));

			return this.resultOk(programs);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not fetch program options');
		}
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
				select: { name: true },
			});

			if (!country) {
				return this.resultFail('Country not found');
			}

			const program = await this.db.program.create({
				data: {
					name: `${country.name} Program ${Math.floor(10000 + Math.random() * 90000)}`,
					countryId: input.countryId,
					amountOfRecipientsForStart: input.amountOfRecipientsForStart ?? null,
					programDurationInMonths: input.programDurationInMonths,
					payoutPerInterval: input.payoutPerInterval,
					payoutCurrency: input.payoutCurrency,
					payoutInterval: input.payoutInterval,
					targetCauses: input.targetCauses,
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

			return this.resultOk({ programId: program.id });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not create program');
		}
	}
}
