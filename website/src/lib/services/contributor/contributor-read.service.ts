import { CountryCode, Prisma, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import {
	ContributorDonationCertificate,
	ContributorOption,
	ContributorPaginatedTableView,
	ContributorPayload,
	ContributorSession,
	ContributorTableQuery,
	ContributorTableViewRow,
	ContributorWithContact,
} from './contributor.types';

export class ContributorReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly organizationAccessService: OrganizationAccessService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private buildContributorOrderBy(query: ContributorTableQuery): Prisma.ContributorOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, ['id', 'contributor', 'email', 'country', 'createdAt'] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'contributor':
				return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }];
			case 'email':
				return [{ contact: { email: direction } }];
			case 'country':
				return [{ contact: { address: { country: direction } } }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ createdAt: 'desc' }];
		}
	}

	private async getContributionSumsByContributorId(contributorIds: string[]): Promise<Map<string, number>> {
		if (contributorIds.length === 0) {
			return new Map();
		}

		const grouped = await this.db.contribution.groupBy({
			by: ['contributorId'],
			where: {
				contributorId: { in: contributorIds },
			},
			_sum: {
				amountChf: true,
			},
		});

		return new Map(grouped.map((row) => [row.contributorId, Number(row._sum.amountChf ?? 0)]));
	}

	async get(userId: string, contributorId: string): Promise<ServiceResult<ContributorPayload>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId } = activeOrgResult.data;

			const contributor = await this.db.contributor.findUnique({
				where: {
					id: contributorId,
					OR: [
						{
							contributions: {
								some: { campaign: { organizationId } },
							},
						},
						{
							contributions: {
								none: {},
							},
						},
					],
				},
				select: {
					id: true,
					contact: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							gender: true,
							callingName: true,
							email: true,
							language: true,
							phone: true,
							profession: true,
							dateOfBirth: true,
							address: true,
						},
					},
					referral: true,
					paymentReferenceId: true,
					stripeCustomerId: true,
				},
			});

			if (!contributor) {
				return this.resultFail('Contributor not found');
			}

			return this.resultOk(contributor);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get contributor: ${JSON.stringify(error)}`);
		}
	}

	async getOptions(userId: string): Promise<ServiceResult<ContributorOption[]>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId } = activeOrgResult.data;

			const contributors = await this.db.contributor.findMany({
				where: {
					OR: [
						{
							contributions: {
								some: { campaign: { organizationId } },
							},
						},
						{
							contributions: {
								none: {},
							},
						},
					],
				},
				select: {
					id: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
				},
				orderBy: { contact: { firstName: 'asc' } },
			});

			const options: ContributorOption[] = contributors.map((contributor) => ({
				id: contributor.id,
				name: `${contributor.contact?.firstName ?? ''} ${contributor.contact?.lastName ?? ''}`.trim(),
			}));

			return this.resultOk(options);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch contributor options: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableView(
		userId: string,
		query: ContributorTableQuery,
	): Promise<ServiceResult<ContributorPaginatedTableView>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId, permission } = activeOrgResult.data;
			const search = query.search.trim();
			const selectedCountry = (query.country?.trim() || undefined) as CountryCode | undefined;
			const baseScope = {
				OR: [
					{
						contributions: {
							some: { campaign: { organizationId } },
						},
					},
					{
						contributions: {
							none: {},
						},
					},
				],
			};
			const where = search
				? {
						AND: [
							baseScope,
							...(selectedCountry
								? [
										{
											contact: { address: { country: selectedCountry } },
										},
									]
								: []),
							{
								OR: [
									{ id: { contains: search, mode: 'insensitive' as const } },
									{ contact: { firstName: { contains: search, mode: 'insensitive' as const } } },
									{ contact: { lastName: { contains: search, mode: 'insensitive' as const } } },
									{ contact: { email: { contains: search, mode: 'insensitive' as const } } },
								],
							},
						],
					}
				: selectedCountry
					? {
							AND: [
								baseScope,
								{
									contact: { address: { country: selectedCountry } },
								},
							],
						}
					: baseScope;

			const sortBy = toSortKey(query.sortBy, [
				'id',
				'contributor',
				'email',
				'country',
				'totalContributedChf',
				'createdAt',
			] as const);
			const contributorSelect = {
				id: true,
				createdAt: true,
				contact: {
					select: {
						firstName: true,
						lastName: true,
						email: true,
						address: { select: { country: true } },
					},
				},
			} as const;

			const [totalCount, countrySource] = await Promise.all([
				this.db.contributor.count({ where }),
				this.db.contributor.findMany({
					where: baseScope,
					select: {
						contact: {
							select: {
								address: {
									select: {
										country: true,
									},
								},
							},
						},
					},
				}),
			]);

			let contributors: Array<
				Prisma.ContributorGetPayload<{
					select: {
						id: true;
						createdAt: true;
						contact: {
							select: {
								firstName: true;
								lastName: true;
								email: true;
								address: { select: { country: true } };
							};
						};
					};
				}>
			>;

			if (sortBy === 'totalContributedChf') {
				const allContributors = await this.db.contributor.findMany({
					where,
					select: contributorSelect,
				});
				const sumsByContributorId = await this.getContributionSumsByContributorId(
					allContributors.map((contributor) => contributor.id),
				);
				const directionMultiplier = query.sortDirection === 'asc' ? 1 : -1;

				const sorted = [...allContributors].sort((left, right) => {
					const leftValue = sumsByContributorId.get(left.id) ?? 0;
					const rightValue = sumsByContributorId.get(right.id) ?? 0;
					if (leftValue !== rightValue) {
						return (leftValue - rightValue) * directionMultiplier;
					}
					return left.id.localeCompare(right.id);
				});

				const start = (query.page - 1) * query.pageSize;
				const end = start + query.pageSize;
				contributors = sorted.slice(start, end);
			} else {
				contributors = await this.db.contributor.findMany({
					where,
					select: contributorSelect,
					orderBy: this.buildContributorOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				});
			}

			const sumsByContributorId = await this.getContributionSumsByContributorId(
				contributors.map((contributor) => contributor.id),
			);

			const tableRows: ContributorTableViewRow[] = contributors.map((c) => ({
				id: c.id,
				firstName: c.contact?.firstName ?? '',
				lastName: c.contact?.lastName ?? '',
				email: c.contact?.email ?? '',
				country: c.contact?.address?.country ?? null,
				totalContributedChf: sumsByContributorId.get(c.id) ?? 0,
				createdAt: c.createdAt,
				permission,
			}));
			const countryFilterOptions = Array.from(
				new Set(
					countrySource
						.map((c) => c.contact?.address?.country)
						.filter((country): country is CountryCode => Boolean(country)),
				),
			)
				.sort()
				.map((country) => ({ value: country, label: country }));

			return this.resultOk({ tableRows, totalCount, countryFilterOptions });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch contributors: ${JSON.stringify(error)}`);
		}
	}

	async getByIds(contributorIds?: string[]): Promise<ServiceResult<ContributorDonationCertificate[]>> {
		try {
			const result = await this.db.contributor.findMany({
				where: contributorIds && contributorIds.length > 0 ? { id: { in: contributorIds } } : {},
				select: {
					id: true,
					account: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							language: true,
							email: true,
							address: true,
						},
					},
				},
				orderBy: { contact: { firstName: 'asc' } },
			});

			const contributors = result.map((c) => ({
				id: c.id,
				firstName: c.contact.firstName,
				lastName: c.contact.lastName,
				language: c.contact.language,
				email: c.contact.email,
				address: c.contact.address,
				authId: c.account.firebaseAuthUserId,
			}));

			return this.resultOk(contributors);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch contributor IDs for certificates: ${JSON.stringify(error)}`);
		}
	}

	findByStripeCustomerOrEmail(
		stripeCustomerId: string,
		email?: string,
	): Promise<ServiceResult<ContributorWithContact | null>> {
		return this.getByStripeCustomerOrEmail(stripeCustomerId, email);
	}

	private async getByStripeCustomerOrEmail(
		stripeCustomerId: string,
		email?: string,
	): Promise<ServiceResult<ContributorWithContact | null>> {
		try {
			let contributor = await this.db.contributor.findFirst({
				where: { stripeCustomerId },
				include: { contact: true },
			});

			if (!contributor && email) {
				contributor = await this.db.contributor.findFirst({
					where: { contact: { email } },
					include: { contact: true },
				});
			}

			return this.resultOk(contributor);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not find contributor: ${JSON.stringify(error)}`);
		}
	}

	async getCurrentContributorSession(firebaseAuthUserId: string): Promise<ServiceResult<ContributorSession>> {
		try {
			const contributor = await this.db.contributor.findFirst({
				where: { account: { firebaseAuthUserId } },
				select: {
					id: true,
					stripeCustomerId: true,
					referral: true,
					contact: {
						select: {
							gender: true,
							email: true,
							firstName: true,
							lastName: true,
							language: true,
							address: {
								select: {
									street: true,
									number: true,
									city: true,
									zip: true,
									country: true,
								},
							},
						},
					},
				},
			});

			if (!contributor) {
				return this.resultFail('Contributor not found');
			}

			const session: ContributorSession = {
				type: 'contributor',
				id: contributor.id,
				gender: contributor.contact?.gender ?? null,
				referral: contributor.referral ?? null,
				email: contributor.contact?.email ?? null,
				firstName: contributor.contact?.firstName ?? null,
				lastName: contributor.contact?.lastName ?? null,
				stripeCustomerId: contributor.stripeCustomerId ?? null,
				language: contributor.contact?.language ?? null,
				street: contributor.contact?.address?.street ?? null,
				number: contributor.contact?.address?.number ?? null,
				city: contributor.contact?.address?.city ?? null,
				zip: contributor.contact?.address?.zip ?? null,
				country: contributor.contact?.address?.country ?? null,
			};

			return this.resultOk(session);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch contributor session: ${JSON.stringify(error)}`);
		}
	}

	async findByPaymentReferenceIds(paymentReferenceIds: string[]): Promise<ServiceResult<ContributorWithContact[]>> {
		try {
			const contributors = await this.db.contributor.findMany({
				where: { paymentReferenceId: { in: paymentReferenceIds } },
				include: { contact: true },
			});

			if (!contributors) {
				return this.resultFail('Contributor not found');
			}

			return this.resultOk(contributors);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not find contributor by Payment Reference ID: ${JSON.stringify(error)}`);
		}
	}
}
