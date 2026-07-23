import {
	Campaign,
	ContributionStatus,
	Currency,
	Prisma,
	PrismaClient,
	ProgramPermission,
} from '@/generated/prisma/client';
import { defaultLanguage, defaultRegion } from '@/lib/i18n/utils';
import { logger } from '@/lib/utils/logger';
import { nowMs } from '@/lib/utils/now';
import { TRAILING_SLASHES_REGEX } from '@/lib/utils/regex';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ExchangeRateReadService } from '../exchange-rate/exchange-rate-read.service';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import {
	CampaignOption,
	CampaignPage,
	CampaignPaginatedTableView,
	CampaignPayload,
	CampaignTableQuery,
	CampaignTableViewRow,
	PublicCampaignActivity,
	PublicCampaignCard,
	PublicCampaignStats,
	PublicCampaignStatsMap,
	PublicCampaignsWithStats,
} from './campaign.types';

export class CampaignReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly programAccessService: ProgramAccessReadService,
		private readonly exchangeRateService: ExchangeRateReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private buildCampaignOrderBy(query: CampaignTableQuery): Prisma.CampaignOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, [
			'id',
			'title',
			'description',
			'currency',
			'endDate',
			'isActive',
			'programName',
			'createdAt',
		] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'title':
				return [{ title: direction }];
			case 'description':
				return [{ description: direction }];
			case 'currency':
				return [{ currency: direction }];
			case 'endDate':
				return [{ endDate: direction }];
			case 'isActive':
				return [{ isActive: direction }];
			case 'programName':
				return [{ program: { name: direction } }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ createdAt: 'desc' }];
		}
	}

	private daysUntilTs(ts: Date): number {
		const diffInMs = ts.getTime() - nowMs();

		return Math.ceil(diffInMs / (24 * 60 * 60 * 1000));
	}

	private isValidExchangeRate(rate: number): boolean {
		return Number.isFinite(rate) && rate > 0;
	}

	private async getExchangeRate(currency: Currency, cache: Map<Currency, number | null>): Promise<number | null> {
		if (currency === Currency.CHF) {
			return 1;
		}

		const cachedRate = cache.get(currency);
		if (cachedRate !== undefined) {
			return cachedRate;
		}

		const exchangeRateResult = await this.exchangeRateService.getLatestRateForCurrency(currency);
		const rate =
			exchangeRateResult.success && this.isValidExchangeRate(exchangeRateResult.data.rate)
				? exchangeRateResult.data.rate
				: null;
		cache.set(currency, rate);

		return rate;
	}

	private async computeCollectedAmount(
		contributions: { amountChf: unknown }[],
		additionalAmountChf: unknown,
		currency: Currency,
		goal: unknown,
		cache: Map<Currency, number | null>,
	): Promise<{ amountCollected: number | null; percentageCollected: number | null }> {
		const exchangeRate = await this.getExchangeRate(currency, cache);
		if (exchangeRate === null) {
			return { amountCollected: null, percentageCollected: null };
		}

		let amountCollected = contributions.reduce((sum, contribution) => sum + Number(contribution.amountChf), 0);
		amountCollected += Number(additionalAmountChf) || 0;
		amountCollected *= exchangeRate;

		const goalAmount = goal ? Number(goal) : null;
		const percentageCollected = goalAmount ? Math.round((amountCollected / goalAmount) * 100) : null;

		return { amountCollected, percentageCollected };
	}

	async get(userId: string, campaignId: string): Promise<ServiceResult<CampaignPayload>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const campaign = await this.db.campaign.findFirst({
				where: { id: campaignId },
				select: {
					id: true,
					title: true,
					description: true,
					secondDescriptionTitle: true,
					secondDescription: true,
					thirdDescriptionTitle: true,
					thirdDescription: true,
					linkWebsite: true,
					linkFacebook: true,
					linkInstagram: true,
					goal: true,
					currency: true,
					additionalAmountChf: true,
					endDate: true,
					isActive: true,
					public: true,
					featured: true,
					slug: true,
					metadataDescription: true,
					metadataOgImage: true,
					metadataTwitterImage: true,
					creatorName: true,
					creatorEmail: true,
					programId: true,
					program: { select: { id: true, name: true } },
					createdAt: true,
					updatedAt: true,
				},
			});

			if (!campaign) {
				return this.resultFail('Campaign not found');
			}
			const hasProgramReadAccess = accessibleProgramsResult.data.some((access) => access.programId === campaign.programId);
			if (!hasProgramReadAccess) {
				return this.resultFail('Permission denied');
			}

			return this.resultOk({
				...campaign,
				goal: campaign.goal ? Number(campaign.goal) : null,
				additionalAmountChf: campaign.additionalAmountChf ? Number(campaign.additionalAmountChf) : null,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch campaign: ${JSON.stringify(error)}`);
		}
	}

	async getById(campaignId: string): Promise<ServiceResult<CampaignPage>> {
		try {
			const campaign = await this.db.campaign.findFirst({
				where: { OR: [{ legacyFirestoreId: campaignId }, { id: campaignId }] },
				select: {
					id: true,
					title: true,
					description: true,
					secondDescriptionTitle: true,
					secondDescription: true,
					thirdDescriptionTitle: true,
					thirdDescription: true,
					linkWebsite: true,
					linkFacebook: true,
					linkInstagram: true,
					goal: true,
					currency: true,
					additionalAmountChf: true,
					endDate: true,
					isActive: true,
					public: true,
					featured: true,
					slug: true,
					metadataDescription: true,
					metadataOgImage: true,
					metadataTwitterImage: true,
					creatorName: true,
					creatorEmail: true,
					program: { select: { id: true, name: true } },
					createdAt: true,
					updatedAt: true,
					contributions: { select: { id: true, amount: true, amountChf: true } },
				},
			});

			if (!campaign) {
				return this.resultFail('Campaign not found');
			}

			const { amountCollected, percentageCollected } = await this.computeCollectedAmount(
				campaign.contributions,
				campaign.additionalAmountChf,
				campaign.currency,
				campaign.goal,
				new Map(),
			);
			const daysLeft = this.daysUntilTs(campaign.endDate);

			return this.resultOk({
				...campaign,
				goal: campaign.goal ? Number(campaign.goal) : null,
				additionalAmountChf: campaign.additionalAmountChf ? Number(campaign.additionalAmountChf) : null,
				numberOfContributions: campaign.contributions.length,
				percentageCollected,
				daysLeft,
				amountCollected,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch campaign: ${JSON.stringify(error)}`);
		}
	}

	async getBySlug(slug: string): Promise<ServiceResult<CampaignPage>> {
		try {
			const normalizedSlug = slug.trim();
			if (!normalizedSlug) {
				return this.resultFail('Missing campaign slug');
			}

			const campaign = await this.db.campaign.findFirst({
				where: { slug: normalizedSlug },
				select: {
					id: true,
					title: true,
					description: true,
					secondDescriptionTitle: true,
					secondDescription: true,
					thirdDescriptionTitle: true,
					thirdDescription: true,
					linkWebsite: true,
					linkFacebook: true,
					linkInstagram: true,
					goal: true,
					currency: true,
					additionalAmountChf: true,
					endDate: true,
					isActive: true,
					public: true,
					featured: true,
					slug: true,
					metadataDescription: true,
					metadataOgImage: true,
					metadataTwitterImage: true,
					creatorName: true,
					creatorEmail: true,
					program: { select: { id: true, name: true } },
					createdAt: true,
					updatedAt: true,
					contributions: { select: { id: true, amount: true, amountChf: true } },
				},
			});

			if (!campaign) {
				return this.resultFail('Campaign not found');
			}

			const { amountCollected, percentageCollected } = await this.computeCollectedAmount(
				campaign.contributions,
				campaign.additionalAmountChf,
				campaign.currency,
				campaign.goal,
				new Map(),
			);
			const daysLeft = this.daysUntilTs(campaign.endDate);

			return this.resultOk({
				...campaign,
				goal: campaign.goal ? Number(campaign.goal) : null,
				additionalAmountChf: campaign.additionalAmountChf ? Number(campaign.additionalAmountChf) : null,
				numberOfContributions: campaign.contributions.length,
				percentageCollected,
				daysLeft,
				amountCollected,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch campaign: ${JSON.stringify(error)}`);
		}
	}

	async getPublicTitleById(campaignId: string): Promise<ServiceResult<{ title: string }>> {
		try {
			const normalizedId = campaignId.trim();
			if (!normalizedId) {
				return this.resultFail('Missing campaign id');
			}

			const campaign = await this.db.campaign.findFirst({
				where: {
					AND: [
						{ OR: [{ id: normalizedId }, { legacyFirestoreId: normalizedId }] },
						{ isActive: true },
						{ slug: { not: null } },
						{ OR: [{ public: true }, { public: null }] },
					],
				},
				select: { title: true },
			});

			if (!campaign) {
				return this.resultFail('Campaign not found');
			}

			return this.resultOk({ title: campaign.title });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch campaign title: ${JSON.stringify(error)}`);
		}
	}

	private buildPublicCampaignActivityWhere(
		activity: PublicCampaignActivity = 'active',
	): Pick<Prisma.CampaignWhereInput, 'isActive'> {
		if (activity === 'all') {
			return {};
		}

		return { isActive: activity === 'active' };
	}

	async getPublicCampaigns(options?: { activity?: PublicCampaignActivity }): Promise<ServiceResult<PublicCampaignCard[]>> {
		const activity = options?.activity ?? 'active';

		try {
			const campaigns = await this.db.campaign.findMany({
				where: {
					...this.buildPublicCampaignActivityWhere(activity),
					slug: { not: null },
					OR: [{ public: true }, { public: null }],
				},
				select: {
					id: true,
					title: true,
					slug: true,
					creatorName: true,
					currency: true,
					featured: true,
					createdAt: true,
					isActive: true,
				},
				orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
			});

			const publicCampaigns: PublicCampaignCard[] = [];

			for (const campaign of campaigns) {
				const campaignSlug = campaign.slug?.trim();
				if (!campaignSlug) {
					continue;
				}

				publicCampaigns.push({
					id: campaign.id,
					title: campaign.title,
					slug: campaignSlug,
					creatorName: campaign.creatorName,
					currency: campaign.currency,
					isActive: campaign.isActive,
				});
			}

			return this.resultOk(publicCampaigns);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch public campaigns: ${JSON.stringify(error)}`);
		}
	}

	async getPublicCampaignStatsByIds(campaignIds: string[]): Promise<ServiceResult<PublicCampaignStatsMap>> {
		try {
			const normalizedCampaignIds = [...new Set(campaignIds.map((campaignId) => campaignId.trim()).filter(Boolean))];
			if (!normalizedCampaignIds.length) {
				return this.resultOk({});
			}

			const campaigns = await this.db.campaign.findMany({
				where: { id: { in: normalizedCampaignIds } },
				select: {
					id: true,
					endDate: true,
					goal: true,
					currency: true,
					additionalAmountChf: true,
					contributions: {
						where: { status: ContributionStatus.succeeded },
						select: { amountChf: true },
					},
				},
			});

			const exchangeRateCache = new Map<Currency, number | null>();
			const statsById: PublicCampaignStatsMap = {};
			for (const campaign of campaigns) {
				const { amountCollected, percentageCollected } = await this.computeCollectedAmount(
					campaign.contributions,
					campaign.additionalAmountChf,
					campaign.currency,
					campaign.goal,
					exchangeRateCache,
				);
				const stats: PublicCampaignStats = {
					contributionsCount: campaign.contributions.length,
					daysLeft: Math.max(0, this.daysUntilTs(campaign.endDate)),
					amountCollected,
					percentageCollected,
				};
				statsById[campaign.id] = stats;
			}

			return this.resultOk(statsById);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch campaign stats map: ${JSON.stringify(error)}`);
		}
	}

	async getPublicCampaignsWithStats(campaigns: PublicCampaignCard[]): Promise<ServiceResult<PublicCampaignsWithStats>> {
		const campaignIds = [...new Set(campaigns.map((campaign) => campaign.id))];
		const statsResult = await this.getPublicCampaignStatsByIds(campaignIds);

		return this.resultOk({
			campaigns,
			statsById: statsResult.success ? statsResult.data : {},
		});
	}

	async getAllPublicCampaignsWithStats(options?: {
		activity?: PublicCampaignActivity;
	}): Promise<ServiceResult<PublicCampaignsWithStats>> {
		const campaignsResult = await this.getPublicCampaigns(options);
		if (!campaignsResult.success) {
			return this.resultFail(campaignsResult.error);
		}

		return this.getPublicCampaignsWithStats(campaignsResult.data);
	}

	async getOtherPublicCampaignsWithStats(
		excludeSlug: string,
		limit: number,
	): Promise<ServiceResult<PublicCampaignsWithStats>> {
		const allResult = await this.getAllPublicCampaignsWithStats();
		if (!allResult.success) {
			return this.resultFail(allResult.error);
		}

		const campaigns = allResult.data.campaigns.filter((campaign) => campaign.slug !== excludeSlug).slice(0, limit);

		if (campaigns.length === 0) {
			return this.resultOk({ campaigns: [], statsById: {} });
		}

		return this.getPublicCampaignsWithStats(campaigns);
	}

	resolvePublicCampaignsBySlugs(slugs: string[], allCampaigns: PublicCampaignCard[]): PublicCampaignCard[] {
		const resolved: PublicCampaignCard[] = [];

		for (const slug of slugs) {
			const normalizedSlug = slug.trim();
			if (!normalizedSlug) {
				continue;
			}

			const campaign = allCampaigns.find((candidate) => candidate.slug === normalizedSlug);
			if (campaign) {
				resolved.push(campaign);
			}
		}

		return resolved;
	}

	async getEditableOptions(userId: string): Promise<ServiceResult<CampaignOption[]>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}
			const programIds = Array.from(
				new Set(
					accessibleProgramsResult.data
						.filter((access) => access.permission === ProgramPermission.operator)
						.map((access) => access.programId),
				),
			);
			if (programIds.length === 0) {
				return this.resultOk([]);
			}

			const campaigns = await this.db.campaign.findMany({
				where: { programId: { in: programIds } },
				select: { id: true, title: true },
				orderBy: { title: 'asc' },
			});

			const options = campaigns.map((campaign) => ({
				id: campaign.id,
				name: campaign.title,
			}));

			return this.resultOk(options);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch editable campaign options: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableView(
		userId: string,
		query: CampaignTableQuery,
	): Promise<ServiceResult<CampaignPaginatedTableView>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}
			const programAccesses = accessibleProgramsResult.data.filter(
				(access) => access.permission === ProgramPermission.operator,
			);
			const programIds = Array.from(new Set(programAccesses.map((access) => access.programId)));
			if (programIds.length === 0) {
				return this.resultOk({ tableRows: [], totalCount: 0 });
			}
			const search = query.search.trim();
			const where = {
				programId: { in: programIds },
				...(search
					? {
							OR: [
								{ id: { contains: search, mode: 'insensitive' as const } },
								{ title: { contains: search, mode: 'insensitive' as const } },
								{ description: { contains: search, mode: 'insensitive' as const } },
								{ program: { name: { contains: search, mode: 'insensitive' as const } } },
							],
						}
					: {}),
			};

			const [campaigns, totalCount] = await Promise.all([
				this.db.campaign.findMany({
					where,
					select: {
						id: true,
						legacyFirestoreId: true,
						slug: true,
						title: true,
						description: true,
						currency: true,
						endDate: true,
						isActive: true,
						programId: true,
						program: { select: { name: true } },
						createdAt: true,
					},
					orderBy: this.buildCampaignOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.campaign.count({ where }),
			]);

			const tableRows: CampaignTableViewRow[] = campaigns.map((campaign) => ({
				id: campaign.id,
				link: this.getCampaignLink(campaign.id, campaign.legacyFirestoreId),
				title: campaign.title,
				description: campaign.description,
				currency: campaign.currency,
				endDate: campaign.endDate,
				isActive: campaign.isActive,
				programName: campaign.program?.name ?? null,
				createdAt: campaign.createdAt,
			}));

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch campaigns: ${JSON.stringify(error)}`);
		}
	}

	async getFallbackCampaign(): Promise<ServiceResult<Campaign>> {
		try {
			const campaign = await this.db.campaign.findFirst({
				where: {
					isFallback: true,
					isActive: true,
				},
			});

			if (!campaign) {
				return this.resultFail('No fallback campaign found');
			}

			return this.resultOk(campaign);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch default campaign: ${JSON.stringify(error)}`);
		}
	}

	async getActiveCampaignForProgram(programId: string): Promise<ServiceResult<Campaign>> {
		try {
			const campaign = await this.db.campaign.findFirst({
				where: {
					programId,
					isActive: true,
				},
			});

			if (campaign) {
				return this.resultOk(campaign);
			}

			return this.getFallbackCampaign();
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch campaign for program: ${JSON.stringify(error)}`);
		}
	}

	private getCampaignLink(id: string, legacyFirestoreId: string | null): string {
		const base = (process.env.BASE_URL ?? '').replace(TRAILING_SLASHES_REGEX, '');

		const campaignId = legacyFirestoreId && legacyFirestoreId.length > 0 ? legacyFirestoreId : id;

		return `${base}/${defaultLanguage}/${defaultRegion}/campaign/${campaignId}`;
	}
}
