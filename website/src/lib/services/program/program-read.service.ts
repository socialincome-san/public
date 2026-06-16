import { PayoutStatus, PrismaClient, ProgramPermission, SurveyStatus } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { ProgramStatsService } from '../program-stats/program-stats.service';
import {
	ProgramOption,
	ProgramSettingsPayload,
	ProgramWallet,
	ProgramWallets,
	PublicPreviewProgram,
	PublicProgramDetails,
	PublicProgramFilterDataMap,
	PublicProgramStats,
	PublicProgramStatsMap,
} from './program.types';

export class ProgramReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly programAccessService: ProgramAccessReadService,
		private readonly programStatsService: ProgramStatsService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private readonly sumPayoutAmounts = (recipients: { payouts: { amount: unknown }[] }[]): number => {
		let sum = 0;
		for (const recipient of recipients) {
			for (const payout of recipient.payouts) {
				sum += Number(payout.amount ?? 0);
			}
		}

		return sum;
	};

	private readonly normalizeProgramPortalSlugs = (portalSlugs: string[]) => [
		...new Set(portalSlugs.map((portalSlug) => portalSlug.trim()).filter(Boolean)),
	];

	async getPublicProgramFilterDataByPortalSlugs(portalSlugs: string[]): Promise<ServiceResult<PublicProgramFilterDataMap>> {
		try {
			const normalizedPortalSlugs = this.normalizeProgramPortalSlugs(portalSlugs);
			if (!normalizedPortalSlugs.length) {
				return this.resultOk({});
			}

			const programs = await this.db.program.findMany({
				where: { slug: { in: normalizedPortalSlugs } },
				select: {
					id: true,
					slug: true,
					country: {
						select: {
							isoCode: true,
						},
					},
					targetFocuses: {
						select: {
							focus: {
								select: {
									id: true,
									slug: true,
								},
							},
						},
					},
				},
			});

			const filterDataByPortalSlug: PublicProgramFilterDataMap = {};
			for (const program of programs) {
				filterDataByPortalSlug[program.slug] = {
					programId: program.id,
					countryIsoCode: program.country.isoCode,
					focuses: program.targetFocuses.map(({ focus }) => focus),
				};
			}

			return this.resultOk(filterDataByPortalSlug);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch program filter data: ${JSON.stringify(error)}`);
		}
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
					const totalPayoutsSum = this.sumPayoutAmounts(program.recipients);

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
		try {
			const base = await this.getProgramWallets(userId);

			if (!base.success) {
				return this.resultFail(base.error);
			}

			const wallet = base.data.wallets.find((w) => w.id === programId);

			if (!wallet) {
				return this.resultFail('Program not found or not accessible');
			}

			return this.resultOk(wallet);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch program wallet: ${JSON.stringify(error)}`);
		}
	}

	async getEditableOptions(userId: string): Promise<ServiceResult<ProgramOption[]>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);

			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const programs = accessibleProgramsResult.data
				.filter((program) => program.permission === ProgramPermission.operator)
				.map((program) => ({
					id: program.programId,
					name: program.programName,
				}));

			return this.resultOk(programs);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch editable program options: ${JSON.stringify(error)}`);
		}
	}

	private readonly publicProgramSelect = {
		id: true,
		name: true,
		targetFocuses: {
			select: {
				focusId: true,
			},
		},
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
				localPartner: { select: { name: true, slug: true } },
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
	};

	private readonly toPublicProgramDetails = (program: {
		id: string;
		name: string;
		targetFocuses: { focusId: string }[];
		amountOfRecipientsForStart: number | null;
		programDurationInMonths: number;
		payoutPerInterval: unknown;
		payoutInterval: PublicProgramDetails['payoutInterval'];
		country: { isoCode: string; currency: PublicProgramDetails['payoutCurrency'] };
		programAccesses: { permission: ProgramPermission; organization: { name: string } }[];
		recipients: {
			startDate: Date | null;
			localPartner: { name: string; slug: string } | null;
			payouts: { amount: unknown }[];
			surveys: { id: string }[];
		}[];
	}): PublicProgramDetails => {
		const ownerAccess = program.programAccesses.find((access) => access.permission === ProgramPermission.owner);
		const operatorAccess = program.programAccesses.find((access) => access.permission === ProgramPermission.operator);

		let totalPayoutsSum = 0;
		let totalPayoutsCount = 0;
		let completedSurveysCount = 0;
		let earliestStart: Date | null = null;
		const localPartnerCounts = new Map<string, { name: string; slug: string; count: number }>();

		for (const recipient of program.recipients) {
			if (recipient.startDate && (!earliestStart || recipient.startDate < earliestStart)) {
				earliestStart = recipient.startDate;
			}

			totalPayoutsSum += this.sumPayoutAmounts([recipient]);
			totalPayoutsCount += recipient.payouts.length;
			completedSurveysCount += recipient.surveys.length;

			const localPartner = recipient.localPartner;
			if (localPartner) {
				const currentCount = localPartnerCounts.get(localPartner.slug);
				localPartnerCounts.set(localPartner.slug, {
					name: localPartner.name,
					slug: localPartner.slug,
					count: (currentCount?.count ?? 0) + 1,
				});
			}
		}

		const topLocalPartner = [...localPartnerCounts.values()].sort((left, right) => right.count - left.count)[0] ?? null;
		const localPartnerName = topLocalPartner?.name ?? null;
		const localPartnerSlug = topLocalPartner?.slug ?? null;

		return {
			programId: program.id,
			programName: program.name,
			countryIsoCode: program.country.isoCode,
			ownerOrganizationName: ownerAccess?.organization.name ?? null,
			localPartnerName,
			localPartnerSlug,
			operatorOrganizationName: operatorAccess?.organization.name ?? null,
			targetFocuses: program.targetFocuses.map((focus) => focus.focusId),
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
		};
	};

	async getPublicProgramBySlug(slug: string): Promise<ServiceResult<PublicProgramDetails>> {
		try {
			const program = await this.db.program.findUnique({
				where: { slug },
				select: this.publicProgramSelect,
			});

			if (!program) {
				return this.resultFail('Program not found');
			}

			return this.resultOk(this.toPublicProgramDetails(program));
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load public program: ${JSON.stringify(error)}`);
		}
	}

	async getPublicPreviewProgramBySlug(slug: string): Promise<ServiceResult<PublicPreviewProgram>> {
		try {
			const program = await this.db.program.findUnique({
				where: { slug },
				select: {
					id: true,
					name: true,
					slug: true,
				},
			});

			if (!program) {
				return this.resultFail('Program not found');
			}

			return this.resultOk(program);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load public preview program: ${JSON.stringify(error)}`);
		}
	}

	async getPublicProgramStatsById(programId: string): Promise<ServiceResult<PublicProgramStats>> {
		try {
			const normalizedProgramId = programId.trim();
			if (!normalizedProgramId) {
				return this.resultFail('Missing program id');
			}

			const statsMapResult = await this.getPublicProgramStatsByIds([normalizedProgramId]);
			if (!statsMapResult.success) {
				return this.resultFail(statsMapResult.error);
			}

			const stats = statsMapResult.data[normalizedProgramId];
			if (!stats) {
				return this.resultFail('Program not found');
			}

			return this.resultOk(stats);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch program stats: ${JSON.stringify(error)}`);
		}
	}

	async getPublicProgramStatsByIds(programIds: string[]): Promise<ServiceResult<PublicProgramStatsMap>> {
		try {
			const normalizedProgramIds = [...new Set(programIds.map((programId) => programId.trim()).filter(Boolean))];
			if (!normalizedProgramIds.length) {
				return this.resultOk({});
			}

			const programs = await this.db.program.findMany({
				where: { id: { in: normalizedProgramIds } },
				select: {
					id: true,
					country: {
						select: { isoCode: true, currency: true },
					},
					_count: {
						select: {
							campaigns: true,
							recipients: true,
						},
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
			});

			const statsById: PublicProgramStatsMap = {};
			for (const program of programs) {
				const totalPayoutsSum = this.sumPayoutAmounts(program.recipients);

				const stats: PublicProgramStats = {
					campaignsCount: program._count.campaigns,
					recipientsCount: program._count.recipients,
					countryIsoCode: program.country.isoCode,
					payoutCurrency: program.country.currency,
					totalPayoutsSum,
				};
				statsById[program.id] = stats;
			}

			return this.resultOk(statsById);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch program stats map: ${JSON.stringify(error)}`);
		}
	}

	async getProgramIdByPortalSlug(slug: string): Promise<ServiceResult<string>> {
		try {
			const program = await this.db.program.findUnique({ where: { slug }, select: { id: true } });
			if (!program) {
				return this.resultFail('Program not found');
			}

			return this.resultOk(program.id);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not resolve programId by slug: ${JSON.stringify(error)}`);
		}
	}

	async getProgramSlugById(programId: string): Promise<ServiceResult<string>> {
		try {
			const program = await this.db.program.findUnique({
				where: { id: programId },
				select: { slug: true },
			});

			if (!program) {
				return this.resultFail('Program not found');
			}

			return this.resultOk(program.slug);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch program slug: ${JSON.stringify(error)}`);
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

	async getSettings(userId: string, programId: string): Promise<ServiceResult<ProgramSettingsPayload>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const programAccesses = accessibleProgramsResult.data.filter((program) => program.programId === programId);
			if (programAccesses.length === 0) {
				return this.resultFail('Permission denied');
			}
			const permission = programAccesses.some((access) => access.permission === ProgramPermission.operator)
				? ProgramPermission.operator
				: ProgramPermission.owner;

			const program = await this.db.program.findUnique({
				where: { id: programId },
				select: {
					id: true,
					name: true,
					slug: true,
					countryId: true,
					country: {
						select: {
							isoCode: true,
							currency: true,
						},
					},
					amountOfRecipientsForStart: true,
					coveredByReserves: true,
					programDurationInMonths: true,
					payoutPerInterval: true,
					payoutInterval: true,
					targetFocuses: {
						select: {
							focusId: true,
						},
					},
					targetProfiles: true,
					programAccesses: {
						select: {
							organizationId: true,
							permission: true,
						},
					},
					createdAt: true,
					updatedAt: true,
				},
			});

			if (!program) {
				return this.resultFail('Program not found');
			}

			return this.resultOk({
				id: program.id,
				name: program.name,
				slug: program.slug,
				countryId: program.countryId,
				country: program.country,
				amountOfRecipientsForStart: program.amountOfRecipientsForStart,
				coveredByReserves: program.coveredByReserves,
				programDurationInMonths: program.programDurationInMonths,
				payoutPerInterval: Number(program.payoutPerInterval),
				payoutInterval: program.payoutInterval,
				targetFocuses: program.targetFocuses.map((focus) => focus.focusId),
				targetProfiles: program.targetProfiles,
				ownerOrganizationIds: program.programAccesses
					.filter((access) => access.permission === ProgramPermission.owner)
					.map((access) => access.organizationId),
				operatorOrganizationIds: program.programAccesses
					.filter((access) => access.permission === ProgramPermission.operator)
					.map((access) => access.organizationId),
				createdAt: program.createdAt,
				updatedAt: program.updatedAt,
				permission,
				canEdit: permission === ProgramPermission.operator,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load program settings: ${JSON.stringify(error)}`);
		}
	}

	async getSettingsOrganizationOptions(
		userId: string,
		programId: string,
	): Promise<ServiceResult<{ id: string; name: string }[]>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const hasReadAccess = accessibleProgramsResult.data.some((access) => access.programId === programId);
			if (!hasReadAccess) {
				return this.resultFail('Permission denied');
			}

			const hasOperatorAccess = accessibleProgramsResult.data.some(
				(access) => access.programId === programId && access.permission === ProgramPermission.operator,
			);
			if (!hasOperatorAccess) {
				const programOrganizations = await this.db.programAccess.findMany({
					where: { programId },
					select: {
						organization: {
							select: {
								id: true,
								name: true,
							},
						},
					},
					orderBy: {
						organization: {
							name: 'asc',
						},
					},
				});

				return this.resultOk(
					programOrganizations.map(({ organization }) => ({
						id: organization.id,
						name: organization.name,
					})),
				);
			}

			const organizations = await this.db.organization.findMany({
				select: {
					id: true,
					name: true,
				},
				orderBy: { name: 'asc' },
			});

			return this.resultOk(organizations);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load organization options: ${JSON.stringify(error)}`);
		}
	}
}
