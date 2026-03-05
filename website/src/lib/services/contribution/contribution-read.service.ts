import { Currency, PaymentEventType, Prisma } from '@/generated/prisma/client';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { endOfYear, startOfYear } from 'date-fns';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import {
	ContributionDonationEntry,
	ContributionPaginatedTableView,
	ContributionPayload,
	ContributionTableQuery,
	ContributionTableViewRow,
	YourContributionsPaginatedTableView,
	YourContributionsTableQuery,
} from './contribution.types';

export class ContributionReadService extends BaseService {
	private organizationAccessService = new OrganizationAccessService();

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
				return [{ campaign: { title: direction } }];
			case 'programName':
				return [{ campaign: { program: { name: direction } } }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ createdAt: 'desc' }];
		}
	}

	private buildYourContributionOrderBy(
		query: YourContributionsTableQuery,
	): Prisma.ContributionOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, ['amount', 'currency', 'campaignTitle', 'createdAt'] as const);
		switch (sortBy) {
			case 'amount':
				return [{ amount: direction }];
			case 'currency':
				return [{ currency: direction }];
			case 'campaignTitle':
				return [{ campaign: { title: direction } }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ createdAt: 'desc' }];
		}
	}

	async get(userId: string, contributionId: string): Promise<ServiceResult<ContributionPayload>> {
		try {
			const accessResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
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
							organizationId: true,
						},
					},
				},
			});

			if (!contribution) {
				return this.resultFail('Contribution not found');
			}

			if (contribution.campaign.organizationId !== accessResult.data.id) {
				return this.resultFail('Permission denied');
			}

			return this.resultOk({
				...contribution,
				amount: Number(contribution.amount),
				amountChf: Number(contribution.amount),
				feesChf: Number(contribution.amount),
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch contribution: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableView(
		userId: string,
		query: ContributionTableQuery,
	): Promise<ServiceResult<ContributionPaginatedTableView>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId, permission } = activeOrgResult.data;
			const search = query.search.trim();
			const selectedProgramId = query.programId?.trim() || undefined;
			const selectedCampaignId = query.campaignId?.trim() || undefined;
			const selectedPaymentEventType = query.paymentEventType?.trim() || undefined;

			const campaigns = await this.db.campaign.findMany({
				where: { organizationId },
				select: {
					id: true,
					title: true,
					program: { select: { id: true, name: true } },
				},
				orderBy: { title: 'asc' },
			});
			const campaignIds = campaigns.map((campaign) => campaign.id);

			const filterOptions = {
				programs: Array.from(
					new Map(
						campaigns
							.filter((campaign) => campaign.program?.id && campaign.program?.name)
							.map((campaign) => [
								campaign.program!.id,
								{ value: campaign.program!.id, label: campaign.program!.name },
							]),
					).values(),
				),
				campaigns: campaigns.map((campaign) => ({ value: campaign.id, label: campaign.title })),
				paymentEventTypes: (Object.values(PaymentEventType) as PaymentEventType[]).map((type) => ({
					value: type,
					label:
						type === 'bank_transfer' ? 'Wire transfer' : type.replace(/_/g, ' ').replace(/^./, (s) => s.toUpperCase()),
				})),
			};

			const filteredCampaignIds = selectedCampaignId
				? campaignIds.filter((id) => id === selectedCampaignId)
				: selectedProgramId
					? campaigns.filter((campaign) => campaign.program?.id === selectedProgramId).map((campaign) => campaign.id)
					: campaignIds;
			if (filteredCampaignIds.length === 0) {
				return this.resultOk({ tableRows: [], totalCount: 0, permission, filterOptions });
			}

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
								{ contributor: { contact: { firstName: { contains: search, mode: 'insensitive' as const } } } },
								{ contributor: { contact: { lastName: { contains: search, mode: 'insensitive' as const } } } },
								{ contributor: { contact: { email: { contains: search, mode: 'insensitive' as const } } } },
								{ campaign: { title: { contains: search, mode: 'insensitive' as const } } },
								{ campaign: { program: { name: { contains: search, mode: 'insensitive' as const } } } },
							],
						}
					: {}),
			};

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
								title: true,
								program: { select: { name: true } },
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
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
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
				campaignTitle: c.campaign?.title ?? '',
				paymentEventType: c.paymentEvent?.type ?? null,
				programName: c.campaign?.program?.name ?? null,
				createdAt: c.createdAt,
			}));

			return this.resultOk({ tableRows, totalCount, permission, filterOptions });
		} catch (error) {
			this.logger.error(error);
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
			this.logger.error(error);
			return this.resultFail(`Could not fetch contributions for contributor ${contributorId}`);
		}
	}

	async getPaginatedYourContributionsTableView(
		contributorId: string,
		query: YourContributionsTableQuery,
	): Promise<ServiceResult<YourContributionsPaginatedTableView>> {
		try {
			const search = query.search.trim();
			const matchedCurrency = Object.values(Currency).find(
				(currency) => currency.toLowerCase() === search.toLowerCase(),
			);
			const where = search
				? {
						AND: [
							{ contributorId },
							{
								OR: [
									{ campaign: { title: { contains: search, mode: 'insensitive' as const } } },
									...(matchedCurrency ? [{ currency: { equals: matchedCurrency } }] : []),
								],
							},
						],
					}
				: { contributorId };

			const [contributions, totalCount] = await Promise.all([
				this.db.contribution.findMany({
					where,
					select: {
						createdAt: true,
						amount: true,
						currency: true,
						campaign: {
							select: { title: true },
						},
					},
					orderBy: this.buildYourContributionOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.contribution.count({ where }),
			]);

			const tableRows = contributions.map((c) => ({
				createdAt: c.createdAt,
				amount: c.amount ? Number(c.amount) : 0,
				currency: c.currency ?? '',
				campaignTitle: c.campaign?.title ?? '',
			}));

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch contributions for contributor: ${JSON.stringify(error)}`);
		}
	}
}
