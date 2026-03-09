import { PayoutStatus, PrismaClient, ProgramPermission, SurveyStatus } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { slugify } from '@/lib/utils/string-utils';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { ProgramStatsService } from '../program-stats/program-stats.service';
import { ProgramOption, ProgramWallet, ProgramWallets, PublicProgramDetails } from './program.types';

export class ProgramReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly programAccessService: ProgramAccessReadService,
		private readonly programStatsService: ProgramStatsService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

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
						select: { isoCode: true, currency: true },
					},
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

			const wallets: ProgramWallet[] = await Promise.all(
				programs.map(async (program) => {
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

					const isReadyForFirstPayoutsResult = await this.programStatsService.isReadyForFirstPayoutInterval(program.id);

					return {
						id: program.id,
						programName: program.name,
						country: program.country.isoCode,
						payoutCurrency: program.country.currency,
						recipientsCount,
						totalPayoutsSum,
						permission,
						isReadyForFirstPayouts: isReadyForFirstPayoutsResult.success ? isReadyForFirstPayoutsResult.data : false,
					};
				}),
			);

			return this.resultOk({ wallets });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch programs: ${JSON.stringify(error)}`);
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
			return this.resultFail(`Could not fetch program options: ${JSON.stringify(error)}`);
		}
	}

	async getPublicProgramBySlug(slug: string): Promise<ServiceResult<PublicProgramDetails>> {
		try {
			const programs = await this.db.program.findMany({
				select: {
					id: true,
					name: true,
					targetCauses: true,
					amountOfRecipientsForStart: true,
					programDurationInMonths: true,
					payoutPerInterval: true,
					payoutInterval: true,
					country: {
						select: { isoCode: true, currency: true },
					},
					programAccesses: {
						select: {
							permission: true,
							organization: { select: { name: true } },
						},
					},
					recipients: {
						select: {
							startDate: true,
							payouts: {
								where: {
									status: {
										in: [PayoutStatus.paid, PayoutStatus.confirmed],
									},
								},
								select: { amount: true },
							},
							surveys: {
								where: { status: SurveyStatus.completed },
								select: { id: true },
							},
						},
					},
				},
			});

			const program = programs.find((p) => slugify(p.name) === slug);

			if (!program) {
				return this.resultFail('Program not found');
			}

			const ownerAccess = program.programAccesses.find((a) => a.permission === ProgramPermission.owner);

			const operatorAccess = program.programAccesses.find((a) => a.permission === ProgramPermission.operator);

			let totalPayoutsSum = 0;
			let totalPayoutsCount = 0;
			let completedSurveysCount = 0;
			let earliestStart: Date | null = null;

			for (const r of program.recipients) {
				if (r.startDate && (!earliestStart || r.startDate < earliestStart)) {
					earliestStart = r.startDate;
				}

				for (const payout of r.payouts) {
					totalPayoutsSum += Number(payout.amount ?? 0);
					totalPayoutsCount++;
				}

				completedSurveysCount += r.surveys.length;
			}

			return this.resultOk({
				programId: program.id,
				programName: program.name,
				countryIsoCode: program.country.isoCode,
				ownerOrganizationName: ownerAccess?.organization.name ?? null,
				operatorOrganizationName: operatorAccess?.organization.name ?? null,
				targetCauses: program.targetCauses,
				amountOfRecipientsForStart: program.amountOfRecipientsForStart,
				programDurationInMonths: program.programDurationInMonths,
				payoutPerInterval: Number(program.payoutPerInterval),
				payoutCurrency: program.country.currency,
				payoutInterval: program.payoutInterval,
				recipientsCount: program.recipients.length,
				totalPayoutsCount,
				totalPayoutsSum,
				completedSurveysCount,
				startedAt: earliestStart,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not load public program: ${JSON.stringify(error)}`);
		}
	}

	async getProgramIdBySlug(slug: string): Promise<ServiceResult<string>> {
		try {
			const programs = await this.db.program.findMany({ select: { id: true, name: true } });
			const match = programs.find((p) => slugify(p.name) === slug);
			if (!match) {
				return this.resultFail('Program not found');
			}
			return this.resultOk(match.id);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not resolve programId by slug: ${JSON.stringify(error)}`);
		}
	}

	async getProgramNameById(programId: string): Promise<ServiceResult<string>> {
		try {
			const program = await this.db.program.findUnique({
				where: { id: programId },
				select: { name: true },
			});

			if (!program) {
				return this.resultFail('Program not found');
			}

			return this.resultOk(program.name);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch program name: ${JSON.stringify(error)}`);
		}
	}
}
