import {
	getCampaignPortalSlug,
	getCampaignTitle,
	getStoryblokCampaignTitleForSlug,
} from '@/components/storyblok/campaign/campaign.utils';
import {
	ContributionStatus,
	Currency,
	PaymentEventType,
	Prisma,
	PrismaClient,
	ProgramPermission,
} from '@/generated/prisma/client';
import { defaultLanguage } from '@/lib/i18n/utils';
import { getCountryNameByCode } from '@/lib/types/country';
import { START_CHARACTER_REGEX, UNDERSCORE_REGEX } from '@/lib/utils/regex';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { endOfYear, startOfYear } from 'date-fns';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { StoryblokService } from '../storyblok/storyblok.service';
import { type GlobeContribution } from './contribution-globe.types';
import {
	ContributionDonationEntry,
	ContributionPaginatedTableView,
	ContributionPayload,
	ContributionTableQuery,
	ContributionTableViewRow,
	ContributorContributionSummary,
	YourContributionsPaginatedTableView,
	YourContributionsTableQuery,
	YourContributionsTableViewRow,
} from './contribution.types';

const RECENT_GLOBE_CONTRIBUTION_LIMIT = 200;

export class ContributionReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly programAccessService: ProgramAccessReadService,
		private readonly storyblokService: StoryblokService,
	) {
		super(db);
	}

	private buildContributionOrderBy(query: ContributionTableQuery): Prisma.ContributionOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, [
			'id',
			'contributor',
			'email',
			'amount',
			'campaignTitle',
			'programName',
			'createdAt',
		] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'contributor':
				return [
					{ contributor: { contact: { firstName: direction } } },
					{ contributor: { contact: { lastName: direction } } },
				];
			case 'email':
				return [{ contributor: { contact: { email: direction } } }];
			case 'amount':
				return [{ amount: direction }];
			case 'campaignTitle':
				return [{ createdAt: 'desc' }];
			case 'programName':
				return [{ campaign: { program: { name: direction } } }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ createdAt: 'desc' }];
		}
	}

	private buildYourContributionOrderBy(query: YourContributionsTableQuery): Prisma.ContributionOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, [
			'amount',
			'paymentEventType',
			'campaignTitle',
			'createdAt',
			'updatedAt',
			'status',
		] as const);
		switch (sortBy) {
			case 'amount':
				return [{ amount: direction }];
			case 'paymentEventType':
				return [{ paymentEvent: { type: direction } }];
			case 'campaignTitle':
				return [{ updatedAt: 'desc' }];
			case 'createdAt':
				return [{ createdAt: direction }];
			case 'updatedAt':
				return [{ updatedAt: direction }];
			case 'status':
				return [{ status: direction }];
			default:
				return [{ updatedAt: 'desc' }];
		}
	}

	private async getCampaignStories() {
		const result = await this.storyblokService.getCampaigns(defaultLanguage);

		return result.success ? result.data : [];
	}

	async get(userId: string, contributionId: string): Promise<ServiceResult<ContributionPayload>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const contribution = await this.db.contribution.findUnique({
				where: {
					id: contributionId,
				},
				select: {
					id: true,
					amount: true,
					currency: true,
					amountChf: true,
					feesChf: true,
					status: true,
					contributor: {
						select: {
							id: true,
						},
					},
					campaign: {
						select: {
							id: true,
							programId: true,
						},
					},
				},
			});

			if (!contribution) {
				return this.resultFail('Contribution not found');
			}

			const hasAccess = accessResult.data.some((program) => program.programId === contribution.campaign.programId);
			if (!hasAccess) {
				return this.resultFail('Permission denied');
			}

			return this.resultOk({
				...contribution,
				amount: Number(contribution.amount),
				amountChf: Number(contribution.amountChf),
				feesChf: Number(contribution.feesChf),
			});
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not fetch contribution: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableView(
		userId: string,
		query: ContributionTableQuery,
	): Promise<ServiceResult<ContributionPaginatedTableView>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}
			const accessiblePrograms = accessibleProgramsResult.data.filter(
				(program) => program.permission === ProgramPermission.operator,
			);
			const accessibleProgramIds = Array.from(new Set(accessiblePrograms.map((p) => p.programId)));
			if (accessibleProgramIds.length === 0) {
				return this.resultOk({
					tableRows: [],
					totalCount: 0,
					filterOptions: { programs: [], campaigns: [], paymentEventTypes: [] },
				});
			}
			const search = query.search.trim();
			const selectedProgramIdRaw = query.programId?.trim();
			const selectedCampaignIdRaw = query.campaignId?.trim();
			const selectedPaymentEventTypeRaw = query.paymentEventType?.trim();
			const selectedProgramId = selectedProgramIdRaw === '' ? undefined : selectedProgramIdRaw;
			const selectedCampaignId = selectedCampaignIdRaw === '' ? undefined : selectedCampaignIdRaw;
			const selectedPaymentEventType = selectedPaymentEventTypeRaw === '' ? undefined : selectedPaymentEventTypeRaw;
			const campaignStories = await this.getCampaignStories();

			const campaigns = await this.db.campaign.findMany({
				where: { programId: { in: accessibleProgramIds }, slug: { not: null } },
				select: {
					id: true,
					slug: true,
					programId: true,
					program: { select: { id: true, name: true } },
				},
				orderBy: { slug: 'asc' },
			});
			const campaignIds = campaigns.map((campaign) => campaign.id);

			const filterOptions = {
				programs: Array.from(
					new Map(
						campaigns
							.filter((campaign) => campaign.program?.id && campaign.program?.name)
							.map((campaign) => [campaign.program.id, { value: campaign.program.id, label: campaign.program.name }]),
					).values(),
				),
				campaigns: campaigns.flatMap((campaign) =>
					campaign.slug
						? [{ value: campaign.id, label: getStoryblokCampaignTitleForSlug(campaignStories, campaign.slug) }]
						: [],
				),
				paymentEventTypes: (Object.values(PaymentEventType) as PaymentEventType[]).map((type) => ({
					value: type,
					label:
						type === 'bank_transfer'
							? 'Wire transfer'
							: type.replace(UNDERSCORE_REGEX, ' ').replace(START_CHARACTER_REGEX, (s) => s.toUpperCase()),
				})),
			};

			const filteredCampaignIds = selectedCampaignId
				? campaignIds.filter((id) => id === selectedCampaignId)
				: selectedProgramId
					? campaigns.filter((campaign) => campaign.program?.id === selectedProgramId).map((campaign) => campaign.id)
					: campaignIds;
			if (filteredCampaignIds.length === 0) {
				return this.resultOk({ tableRows: [], totalCount: 0, filterOptions });
			}
			const campaignIdsMatchingTitle = search
				? campaigns
						.filter(
							(campaign) =>
								campaign.slug &&
								getStoryblokCampaignTitleForSlug(campaignStories, campaign.slug)
									.toLocaleLowerCase()
									.includes(search.toLocaleLowerCase()),
						)
						.map((campaign) => campaign.id)
				: [];

			const where = {
				campaignId: { in: filteredCampaignIds },
				...(selectedPaymentEventType
					? {
							paymentEvent: {
								type: selectedPaymentEventType as PaymentEventType,
							},
						}
					: {}),
				...(search
					? {
							OR: [
								{ id: { contains: search, mode: 'insensitive' as const } },
								{ contributor: { contact: { firstName: { contains: search, mode: 'insensitive' as const } } } },
								{ contributor: { contact: { lastName: { contains: search, mode: 'insensitive' as const } } } },
								{ contributor: { contact: { email: { contains: search, mode: 'insensitive' as const } } } },
								{ campaign: { slug: { contains: search, mode: 'insensitive' as const } } },
								...(campaignIdsMatchingTitle.length > 0 ? [{ campaignId: { in: campaignIdsMatchingTitle } }] : []),
								{ campaign: { program: { name: { contains: search, mode: 'insensitive' as const } } } },
							],
						}
					: {}),
			};

			const sortByCampaignTitle = query.sortBy === 'campaignTitle';
			const [contributions, totalCount] = await Promise.all([
				this.db.contribution.findMany({
					where,
					select: {
						id: true,
						createdAt: true,
						amount: true,
						currency: true,
						paymentEvent: { select: { type: true } },
						campaign: {
							select: {
								id: true,
								slug: true,
								program: { select: { id: true, name: true } },
							},
						},
						contributor: {
							select: {
								contact: {
									select: {
										firstName: true,
										lastName: true,
										email: true,
									},
								},
							},
						},
					},
					orderBy: this.buildContributionOrderBy(query),
					...(sortByCampaignTitle
						? {}
						: {
								skip: (query.page - 1) * query.pageSize,
								take: query.pageSize,
							}),
				}),
				this.db.contribution.count({ where }),
			]);

			const tableRows: ContributionTableViewRow[] = contributions.map((c) => ({
				id: c.id,
				firstName: c.contributor?.contact?.firstName ?? '',
				lastName: c.contributor?.contact?.lastName ?? '',
				email: c.contributor?.contact?.email ?? '',
				amount: c.amount ? Number(c.amount) : 0,
				currency: c.currency ?? '',
				campaignId: c.campaign?.id ?? '',
				campaignTitle: c.campaign?.slug ? getStoryblokCampaignTitleForSlug(campaignStories, c.campaign.slug) : '',
				paymentEventType: c.paymentEvent?.type ?? null,
				programName: c.campaign?.program?.name ?? null,
				createdAt: c.createdAt,
			}));
			if (sortByCampaignTitle) {
				const direction = query.sortDirection === 'asc' ? 1 : -1;
				tableRows.sort((left, right) => direction * left.campaignTitle.localeCompare(right.campaignTitle));
			}
			const paginatedRows = sortByCampaignTitle
				? tableRows.slice((query.page - 1) * query.pageSize, query.page * query.pageSize)
				: tableRows;

			return this.resultOk({ tableRows: paginatedRows, totalCount, filterOptions });
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not fetch contributions: ${JSON.stringify(error)}`);
		}
	}

	async getSucceededForContributorAndYear(
		contributorId: string,
		year: number,
	): Promise<ServiceResult<ContributionDonationEntry[]>> {
		try {
			const start = startOfYear(new Date(year, 0, 1));
			const end = endOfYear(new Date(year, 0, 1));

			const result = await this.db.contribution.findMany({
				where: {
					contributorId: contributorId,
					AND: [{ createdAt: { gte: start } }, { createdAt: { lte: end } }, { status: 'succeeded' }],
				},
				select: {
					contributorId: true,
					amount: true,
					currency: true,
					amountChf: true,
					feesChf: true,
					status: true,
					createdAt: true,
				},
			});

			const contributions = result.map((r) => ({
				contributorId: r.contributorId,
				amount: Number(r.amount),
				currency: r.currency,
				amountChf: Number(r.amountChf),
				feesChf: Number(r.feesChf),
				status: r.status,
				createdAt: r.createdAt,
			}));

			return this.resultOk(contributions);
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not fetch contributions for contributor ${contributorId}`);
		}
	}

	async getContributorContributionSummary(contributorId: string): Promise<ServiceResult<ContributorContributionSummary>> {
		try {
			const [aggregate, firstContribution] = await Promise.all([
				this.db.contribution.aggregate({
					where: { contributorId, status: 'succeeded' },
					_sum: { amountChf: true },
					_count: { _all: true },
				}),
				this.db.contribution.findFirst({
					where: { contributorId, status: 'succeeded' },
					orderBy: { createdAt: 'asc' },
					select: { createdAt: true },
				}),
			]);

			return this.resultOk({
				totalAmountChf: Number(aggregate._sum.amountChf ?? 0),
				count: aggregate._count._all,
				firstContributionAt: firstContribution?.createdAt ?? null,
			});
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not fetch contribution summary for contributor ${contributorId}`);
		}
	}

	async getPaginatedYourContributionsTableView(
		contributorId: string,
		query: YourContributionsTableQuery,
	): Promise<ServiceResult<YourContributionsPaginatedTableView>> {
		try {
			const search = query.search.trim();
			const matchedCurrency = Object.values(Currency).find((currency) => currency.toLowerCase() === search.toLowerCase());
			const campaignStories = await this.getCampaignStories();
			const campaignSlugsMatchingTitle = search
				? campaignStories
						.filter((story) => getCampaignTitle(story.content).toLocaleLowerCase().includes(search.toLocaleLowerCase()))
						.map((story) => getCampaignPortalSlug(story.content))
						.filter(Boolean)
				: [];
			const where = search
				? {
						AND: [
							{ contributorId },
							{
								OR: [
									{ campaign: { slug: { contains: search, mode: 'insensitive' as const } } },
									...(campaignSlugsMatchingTitle.length > 0
										? [{ campaign: { slug: { in: campaignSlugsMatchingTitle } } }]
										: []),
									...(matchedCurrency ? [{ currency: { equals: matchedCurrency } }] : []),
								],
							},
						],
					}
				: { contributorId };

			const sortByCampaignTitle = query.sortBy === 'campaignTitle';
			const [contributions, totalCount] = await Promise.all([
				this.db.contribution.findMany({
					where,
					select: {
						createdAt: true,
						updatedAt: true,
						amount: true,
						currency: true,
						status: true,
						paymentEvent: { select: { type: true } },
						campaign: {
							select: { slug: true },
						},
					},
					orderBy: this.buildYourContributionOrderBy(query),
					...(sortByCampaignTitle
						? {}
						: {
								skip: (query.page - 1) * query.pageSize,
								take: query.pageSize,
							}),
				}),
				this.db.contribution.count({ where }),
			]);

			const tableRows: YourContributionsTableViewRow[] = contributions.map((c) => ({
				createdAt: c.createdAt,
				updatedAt: c.updatedAt,
				amount: c.amount ? Number(c.amount) : 0,
				currency: c.currency ?? '',
				campaignTitle: c.campaign?.slug ? getStoryblokCampaignTitleForSlug(campaignStories, c.campaign.slug) : '',
				paymentEventType: c.paymentEvent?.type ?? null,
				status: c.status,
			}));
			if (sortByCampaignTitle) {
				const direction = query.sortDirection === 'asc' ? 1 : -1;
				tableRows.sort((left, right) => direction * left.campaignTitle.localeCompare(right.campaignTitle));
			}
			const paginatedRows = sortByCampaignTitle
				? tableRows.slice((query.page - 1) * query.pageSize, query.page * query.pageSize)
				: tableRows;

			return this.resultOk({ tableRows: paginatedRows, totalCount });
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not fetch contributions for contributor: ${JSON.stringify(error)}`);
		}
	}

	async getRecentSuccessfulContributions(cutoff: Date): Promise<ServiceResult<GlobeContribution[]>> {
		try {
			const rows = await this.db.contribution.findMany({
				where: {
					status: ContributionStatus.succeeded,
					createdAt: { gte: cutoff },
				},
				select: {
					amount: true,
					currency: true,
					createdAt: true,
					contributor: {
						select: {
							contact: {
								select: {
									address: {
										select: { country: true },
									},
								},
							},
						},
					},
				},
				orderBy: { createdAt: 'desc' },
				take: RECENT_GLOBE_CONTRIBUTION_LIMIT,
			});

			let skipped = 0;
			const contributions: GlobeContribution[] = [];

			for (const row of rows) {
				const countryCode = row.contributor.contact?.address?.country ?? null;
				if (!countryCode) {
					skipped++;
					continue;
				}
				contributions.push({
					key: `contribution-${contributions.length}`,
					amount: Number(row.amount),
					currency: row.currency,
					contributedAt: row.createdAt.toISOString(),
					countryCode,
					countryName: getCountryNameByCode(countryCode),
				});
			}

			if (skipped > 0) {
				console.warn(`Skipped ${skipped} contributions without a country for globe visualization.`);
			}

			return this.resultOk(contributions);
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not fetch recent contributions for globe: ${JSON.stringify(error)}`);
		}
	}
}
