import { Campaign, Prisma, PrismaClient } from '@/generated/prisma/client';
import { defaultLanguage, defaultRegion } from '@/lib/i18n/utils';
import { logger } from '@/lib/utils/logger';
import { nowMs } from '@/lib/utils/now';
import { TRAILING_SLASHES_REGEX } from '@/lib/utils/regex';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ExchangeRateReadService } from '../exchange-rate/exchange-rate-read.service';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import {
	CampaignOption,
	CampaignPage,
	CampaignPaginatedTableView,
	CampaignPayload,
	CampaignTableQuery,
	CampaignTableViewRow,
} from './campaign.types';

export class CampaignReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly organizationAccessService: OrganizationAccessService,
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
			const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);

			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const { id: organizationId } = accessResult.data;

			const campaign = await this.db.campaign.findFirst({
				where: { id: campaignId, organizationId },
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
				},
			});

			if (!campaign) {
				return this.resultFail('Campaign not found');
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

	async getOptions(userId: string): Promise<ServiceResult<CampaignOption[]>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const campaigns = await this.db.campaign.findMany({
				where: { organizationId: activeOrgResult.data.id },
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
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId, permission } = activeOrgResult.data;
			const search = query.search.trim();
			const where = {
				organizationId,
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
				permission,
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
