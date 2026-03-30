import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import {
	LocalPartnerOption,
	LocalPartnerPaginatedTableView,
	LocalPartnerPayload,
	LocalPartnerSession,
	LocalPartnerTableQuery,
	LocalPartnerTableView,
	LocalPartnerTableViewRow,
} from './local-partner.types';

export class LocalPartnerReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async getPublicLocalPartnerStatsById(
		localPartnerId: string,
	): Promise<ServiceResult<{ assignedRecipientsCount: number; waitingRecipientsCount: number }>> {
		try {
			const normalizedLocalPartnerId = localPartnerId.trim();
			if (!normalizedLocalPartnerId) {
				return this.resultFail('Missing local partner id');
			}

			const statsMapResult = await this.getPublicLocalPartnerStatsByIds([normalizedLocalPartnerId]);
			if (!statsMapResult.success) {
				return this.resultFail(statsMapResult.error);
			}

			const stats = statsMapResult.data[normalizedLocalPartnerId];
			if (!stats) {
				return this.resultFail('Local partner not found');
			}

			return this.resultOk(stats);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch local partner stats: ${JSON.stringify(error)}`);
		}
	}

	async getPublicLocalPartnerStatsByIds(
		localPartnerIds: string[],
	): Promise<ServiceResult<Record<string, { assignedRecipientsCount: number; waitingRecipientsCount: number }>>> {
		try {
			const normalizedLocalPartnerIds = [...new Set(localPartnerIds.map((id) => id.trim()).filter(Boolean))];
			if (!normalizedLocalPartnerIds.length) {
				return this.resultOk({});
			}

			const [partners, assignedRecipientGroups, waitingRecipientGroups] = await Promise.all([
				this.db.localPartner.findMany({
					where: { id: { in: normalizedLocalPartnerIds } },
					select: { id: true },
				}),
				this.db.recipient.groupBy({
					by: ['localPartnerId'],
					where: {
						localPartnerId: { in: normalizedLocalPartnerIds },
						programId: { not: null },
					},
					_count: { _all: true },
				}),
				this.db.recipient.groupBy({
					by: ['localPartnerId'],
					where: {
						localPartnerId: { in: normalizedLocalPartnerIds },
						programId: null,
					},
					_count: { _all: true },
				}),
			]);

			const statsByLocalPartnerId: Record<string, { assignedRecipientsCount: number; waitingRecipientsCount: number }> =
				Object.fromEntries(
					partners.map((partner) => [
						partner.id,
						{
							assignedRecipientsCount: 0,
							waitingRecipientsCount: 0,
						},
					]),
				);

			for (const group of assignedRecipientGroups) {
				if (statsByLocalPartnerId[group.localPartnerId]) {
					statsByLocalPartnerId[group.localPartnerId].assignedRecipientsCount = group._count._all;
				}
			}

			for (const group of waitingRecipientGroups) {
				if (statsByLocalPartnerId[group.localPartnerId]) {
					statsByLocalPartnerId[group.localPartnerId].waitingRecipientsCount = group._count._all;
				}
			}

			return this.resultOk(statsByLocalPartnerId);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch local partner stats map: ${JSON.stringify(error)}`);
		}
	}

	private buildLocalPartnerOrderBy(query: LocalPartnerTableQuery): Prisma.LocalPartnerOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, [
			'id',
			'name',
			'contactPerson',
			'email',
			'firebaseAuthUserId',
			'contactNumber',
			'recipientsCount',
			'createdAt',
		] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'name':
				return [{ name: direction }];
			case 'contactPerson':
				return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }];
			case 'email':
				return [{ contact: { email: direction } }];
			case 'firebaseAuthUserId':
				return [{ account: { firebaseAuthUserId: direction } }];
			case 'contactNumber':
				return [{ contact: { phone: { number: direction } } }];
			case 'recipientsCount':
				return [{ recipients: { _count: direction } }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ name: 'asc' }];
		}
	}

	async get(userId: string, localPartnerId: string): Promise<ServiceResult<LocalPartnerPayload>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const partner = await this.db.localPartner.findUnique({
				where: { id: localPartnerId },
				select: {
					id: true,
					name: true,
					focuses: { select: { focusId: true } },
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
				},
			});

			if (!partner) {
				return this.resultFail('Could not get local partner');
			}

			return this.resultOk({
				id: partner.id,
				name: partner.name,
				focuses: partner.focuses.map((focus) => focus.focusId),
				contact: partner.contact,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get local partner: ${JSON.stringify(error)}`);
		}
	}

	async getTableView(userId: string): Promise<ServiceResult<LocalPartnerTableView>> {
		try {
			const paginated = await this.getPaginatedTableView(userId, {
				page: 1,
				pageSize: 10_000,
				search: '',
			});
			if (!paginated.success) {
				return this.resultFail(paginated.error);
			}

			return this.resultOk({ tableRows: paginated.data.tableRows });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch local partner table view: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableView(
		userId: string,
		query: LocalPartnerTableQuery,
	): Promise<ServiceResult<LocalPartnerPaginatedTableView>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const search = query.search.trim();
			const where = search
				? {
						OR: [
							{ id: { contains: search, mode: 'insensitive' as const } },
							{ name: { contains: search, mode: 'insensitive' as const } },
							{ contact: { firstName: { contains: search, mode: 'insensitive' as const } } },
							{ contact: { lastName: { contains: search, mode: 'insensitive' as const } } },
							{ contact: { email: { contains: search, mode: 'insensitive' as const } } },
							{ account: { firebaseAuthUserId: { contains: search, mode: 'insensitive' as const } } },
							{ contact: { phone: { number: { contains: search, mode: 'insensitive' as const } } } },
							{
								focuses: {
									some: {
										focus: { name: { contains: search, mode: 'insensitive' as const } },
									},
								},
							},
						],
					}
				: undefined;

			const [partners, totalCount] = await Promise.all([
				this.db.localPartner.findMany({
					where,
					select: {
						id: true,
						name: true,
						createdAt: true,
						contact: {
							select: {
								firstName: true,
								lastName: true,
								email: true,
								phone: { select: { number: true } },
							},
						},
						account: {
							select: {
								firebaseAuthUserId: true,
							},
						},
						focuses: {
							select: {
								focus: { select: { name: true } },
							},
						},
						_count: { select: { recipients: true } },
					},
					orderBy: this.buildLocalPartnerOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.localPartner.count({ where }),
			]);

			const tableRows: LocalPartnerTableViewRow[] = partners.map((partner) => ({
				id: partner.id,
				name: partner.name,
				contactPerson: `${partner.contact?.firstName ?? ''} ${partner.contact?.lastName ?? ''}`.trim(),
				email: partner.contact?.email ?? null,
				firebaseAuthUserId: partner.account.firebaseAuthUserId,
				contactNumber: partner.contact?.phone?.number ?? null,
				focuses: partner.focuses.map((focus) => focus.focus.name).join(', '),
				recipientsCount: partner._count.recipients,
				createdAt: partner.createdAt,
			}));

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch local partners: ${JSON.stringify(error)}`);
		}
	}

	async getOptions(): Promise<ServiceResult<LocalPartnerOption[]>> {
		try {
			const partners = await this.db.localPartner.findMany({
				select: {
					id: true,
					name: true,
				},
				orderBy: { name: 'asc' },
			});

			return this.resultOk(partners);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch local partners: ${JSON.stringify(error)}`);
		}
	}

	async getCurrentLocalPartnerSession(firebaseAuthUserId: string): Promise<ServiceResult<LocalPartnerSession>> {
		try {
			const partner = await this.db.localPartner.findFirst({
				where: { account: { firebaseAuthUserId } },
				select: {
					id: true,
					name: true,
					focuses: {
						select: {
							focusId: true,
						},
					},
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

			if (!partner) {
				return this.resultFail('Local partner not found');
			}

			const session: LocalPartnerSession = {
				type: 'local-partner',
				id: partner.id,
				name: partner.name,
				focuses: partner.focuses.map((focus) => focus.focusId),
				gender: partner.contact?.gender ?? null,
				email: partner.contact?.email ?? null,
				firstName: partner.contact?.firstName ?? null,
				lastName: partner.contact?.lastName ?? null,
				language: partner.contact?.language ?? null,
				street: partner.contact?.address?.street ?? null,
				number: partner.contact?.address?.number ?? null,
				city: partner.contact?.address?.city ?? null,
				zip: partner.contact?.address?.zip ?? null,
				country: partner.contact?.address?.country ?? null,
			};

			return this.resultOk(session);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch local partner session: ${JSON.stringify(error)}`);
		}
	}
}
