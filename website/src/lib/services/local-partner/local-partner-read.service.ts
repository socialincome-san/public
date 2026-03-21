import { Cause, Prisma, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { UNDERSCORE_REGEX } from '@/lib/utils/regex';
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
					causes: true,
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

			return this.resultOk(partner);
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
			const matchingCauses = Object.values(Cause).filter((cause) => cause.toLowerCase().includes(search.toLowerCase()));
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
							...(matchingCauses.length > 0 ? [{ causes: { hasSome: matchingCauses } }] : []),
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
						causes: true,
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
				causes: partner.causes.map((cause) => cause.replace(UNDERSCORE_REGEX, ' ')).join(', '),
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
					causes: true,
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
				causes: partner.causes,
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
