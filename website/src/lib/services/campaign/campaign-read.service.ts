import { Campaign, Prisma, PrismaClient, ProgramPermission } from '@/generated/prisma/client';
import { defaultLanguage, defaultRegion } from '@/lib/i18n/utils';
import { logger } from '@/lib/utils/logger';
import { nowMs } from '@/lib/utils/now';
import { TRAILING_SLASHES_REGEX } from '@/lib/utils/regex';
import { slugify } from '@/lib/utils/string-utils';
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
} from './campaign.types';

type PublicPreviewCampaign = {
	id: string;
	title: string;
	description: string;
	slug: string;
};

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

			const exchangeRateRes = await this.exchangeRateService.getLatestRateForCurrency(campaign.currency);
			const exchangeRate = exchangeRateRes.success ? exchangeRateRes.data.rate : 1.0;

			let amountCollected = campaign.contributions?.reduce((sum, c) => sum + Number(c.amountChf), 0) || 0;
			amountCollected += Number(campaign.additionalAmountChf) || 0;
			amountCollected *= exchangeRate;

			const percentageCollected = campaign.goal ? Math.round((amountCollected / Number(campaign.goal)) * 100) : null;
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

	async getPublicPreviewCampaignBySlug(slug: string): Promise<ServiceResult<PublicPreviewCampaign>> {
		try {
			const normalizedSlug = slug.trim();
			if (!normalizedSlug) {
				return this.resultFail('Missing campaign slug');
			}

			const campaigns = await this.db.campaign.findMany({
				select: { id: true, title: true, description: true, slug: true },
			});
			const campaign = campaigns.find((currentCampaign) => slugify(currentCampaign.title) === normalizedSlug);

			if (!campaign?.slug) {
				return this.resultFail('Campaign not found');
			}

			return this.resultOk({
				id: campaign.id,
				title: campaign.title,
				description: campaign.description,
				slug: campaign.slug,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load public preview campaign: ${JSON.stringify(error)}`);
		}
	}

	async getPublicCampaignStatsById(
		campaignId: string,
	): Promise<ServiceResult<{ contributionsCount: number; daysLeft: number }>> {
		try {
			const normalizedCampaignId = campaignId.trim();
			if (!normalizedCampaignId) {
				return this.resultFail('Missing campaign id');
			}

			const statsMapResult = await this.getPublicCampaignStatsByIds([normalizedCampaignId]);
			if (!statsMapResult.success) {
				return this.resultFail(statsMapResult.error);
			}

			const stats = statsMapResult.data[normalizedCampaignId];
			if (!stats) {
				return this.resultFail('Campaign not found');
			}

			return this.resultOk(stats);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch campaign stats: ${JSON.stringify(error)}`);
		}
	}

	async getPublicCampaignStatsByIds(
		campaignIds: string[],
	): Promise<ServiceResult<Record<string, { contributionsCount: number; daysLeft: number }>>> {
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
					_count: {
						select: {
							contributions: true,
						},
					},
				},
			});

			const statsById: Record<string, { contributionsCount: number; daysLeft: number }> = {};
			for (const campaign of campaigns) {
				statsById[campaign.id] = {
					contributionsCount: campaign._count.contributions,
					daysLeft: Math.max(0, this.daysUntilTs(campaign.endDate)),
				};
			}

			return this.resultOk(statsById);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch campaign stats map: ${JSON.stringify(error)}`);
		}
	}

	async getOptions(userId: string): Promise<ServiceResult<CampaignOption[]>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}
			const programIds = Array.from(new Set(accessibleProgramsResult.data.map((access) => access.programId)));
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

			return this.resultFail(`Could not fetch campaign options: ${JSON.stringify(error)}`);
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
			const programAccesses = accessibleProgramsResult.data;
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
				permission: programAccesses.some(
					(access) => access.programId === campaign.programId && access.permission === ProgramPermission.operator,
				)
					? ProgramPermission.operator
					: ProgramPermission.owner,
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
