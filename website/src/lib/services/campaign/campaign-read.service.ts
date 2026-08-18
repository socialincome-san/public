import { Campaign, ContributionStatus, Currency, PrismaClient, ProgramPermission } from '@/generated/prisma/client';
import { defaultLanguage, defaultRegion } from '@/lib/i18n/utils';
import { logger } from '@/lib/utils/logger';
import { nowMs } from '@/lib/utils/now';
import { TRAILING_SLASHES_REGEX } from '@/lib/utils/regex';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ExchangeRateReadService } from '../exchange-rate/exchange-rate-read.service';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { isCampaignActive, matchesPublicCampaignActivity } from './campaign-public-activity';
import {
	CampaignOption,
	CampaignPage,
	CampaignTableEntry,
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
					slug: true,
					metadataDescription: true,
					metadataOgImage: true,
					metadataTwitterImage: true,
					creatorName: true,
					creatorEmail: true,
					program: { select: { id: true, name: true } },
					createdAt: true,
					updatedAt: true,
					contributions: {
						where: { status: ContributionStatus.succeeded },
						select: { id: true, amount: true, amountChf: true },
					},
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

	async getByPortalSlug(portalSlug: string): Promise<ServiceResult<CampaignPage>> {
		try {
			const normalizedSlug = portalSlug.trim();
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
					slug: true,
					metadataDescription: true,
					metadataOgImage: true,
					metadataTwitterImage: true,
					creatorName: true,
					creatorEmail: true,
					program: { select: { id: true, name: true } },
					createdAt: true,
					updatedAt: true,
					contributions: {
						where: { status: ContributionStatus.succeeded },
						select: { id: true, amount: true, amountChf: true },
					},
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
					AND: [{ OR: [{ id: normalizedId }, { legacyFirestoreId: normalizedId }] }, { slug: { not: null } }],
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

	private async mapPublicCampaignCards(
		campaigns: {
			id: string;
			title: string;
			slug: string | null;
			creatorName: string | null;
			currency: Currency;
			endDate: Date;
			goal: unknown;
			additionalAmountChf: unknown;
			contributions: { amountChf: unknown }[];
		}[],
		activity: PublicCampaignActivity,
	): Promise<PublicCampaignCard[]> {
		const exchangeRateCache = new Map<Currency, number | null>();
		const publicCampaigns: PublicCampaignCard[] = [];

		for (const campaign of campaigns) {
			const campaignSlug = campaign.slug?.trim();
			if (!campaignSlug) {
				continue;
			}

			const { amountCollected } = await this.computeCollectedAmount(
				campaign.contributions,
				campaign.additionalAmountChf,
				campaign.currency,
				campaign.goal,
				exchangeRateCache,
			);
			const isActive = isCampaignActive({
				endDate: campaign.endDate,
				goal: campaign.goal,
				amountCollected,
			});

			if (!matchesPublicCampaignActivity(isActive, activity)) {
				continue;
			}

			const goal = campaign.goal !== null && campaign.goal !== undefined ? Number(campaign.goal) : null;

			publicCampaigns.push({
				id: campaign.id,
				title: campaign.title,
				slug: campaignSlug,
				creatorName: campaign.creatorName,
				currency: campaign.currency,
				endDate: campaign.endDate,
				goal: Number.isFinite(goal) ? goal : null,
				isActive,
			});
		}

		return publicCampaigns;
	}

	async getCampaignsForCmsJoin(options?: {
		activity?: PublicCampaignActivity;
	}): Promise<ServiceResult<PublicCampaignCard[]>> {
		const activity = options?.activity ?? 'active';

		try {
			const campaigns = await this.db.campaign.findMany({
				where: {
					slug: { not: null },
				},
				select: {
					id: true,
					title: true,
					slug: true,
					creatorName: true,
					currency: true,
					endDate: true,
					goal: true,
					additionalAmountChf: true,
					contributions: {
						where: { status: ContributionStatus.succeeded },
						select: { amountChf: true },
					},
				},
				orderBy: [{ createdAt: 'desc' }],
			});

			return this.resultOk(await this.mapPublicCampaignCards(campaigns, activity));
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch campaigns for CMS join: ${JSON.stringify(error)}`);
		}
	}

	async getAllCampaignsForCmsJoinWithStats(options?: {
		activity?: PublicCampaignActivity;
	}): Promise<ServiceResult<PublicCampaignsWithStats>> {
		const campaignsResult = await this.getCampaignsForCmsJoin(options);
		if (!campaignsResult.success) {
			return this.resultFail(campaignsResult.error);
		}

		return this.getPublicCampaignsWithStats(campaignsResult.data);
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

	async getTableEntries(userId: string): Promise<ServiceResult<CampaignTableEntry[]>> {
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
				return this.resultOk([]);
			}

			const campaigns = await this.db.campaign.findMany({
				where: { programId: { in: programIds } },
				select: {
					id: true,
					legacyFirestoreId: true,
					title: true,
					description: true,
					currency: true,
					endDate: true,
					goal: true,
					additionalAmountChf: true,
					program: { select: { name: true, slug: true } },
					createdAt: true,
					contributions: {
						where: { status: ContributionStatus.succeeded },
						select: { amountChf: true },
					},
				},
			});

			const exchangeRateCache = new Map<Currency, number | null>();
			const entries: CampaignTableEntry[] = [];
			for (const campaign of campaigns) {
				const { amountCollected } = await this.computeCollectedAmount(
					campaign.contributions,
					campaign.additionalAmountChf,
					campaign.currency,
					campaign.goal,
					exchangeRateCache,
				);

				entries.push({
					id: campaign.id,
					link: this.getCampaignLink(campaign.id, campaign.legacyFirestoreId),
					title: campaign.title,
					description: campaign.description,
					currency: campaign.currency,
					endDate: campaign.endDate,
					isActive: isCampaignActive({
						endDate: campaign.endDate,
						goal: campaign.goal,
						amountCollected,
					}),
					programName: campaign.program?.name ?? null,
					programPortalSlug: campaign.program?.slug ?? null,
					createdAt: campaign.createdAt,
				});
			}

			return this.resultOk(entries);
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

	async getFallbackCampaignForProgram(programId: string): Promise<ServiceResult<Campaign>> {
		try {
			const campaign = await this.db.campaign.findFirst({
				where: {
					programId,
					isFallback: true,
				},
			});

			if (campaign) {
				return this.resultOk(campaign);
			}

			return this.resultFail('No fallback campaign found');
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
