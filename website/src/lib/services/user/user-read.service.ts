import { Prisma, UserRole } from '@/generated/prisma/client';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserPaginatedTableView, UserPayload, UserSession, UserTableQuery, UserTableViewRow } from './user.types';

export class UserReadService extends BaseService {
	private buildUserOrderBy(query: UserTableQuery): Prisma.UserOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, [
			'id',
			'user',
			'email',
			'role',
			'organizationName',
			'readonlyOrganizationNames',
			'editOrganizationNames',
			'createdAt',
		] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'user':
				return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }];
			case 'email':
				return [{ contact: { email: direction } }];
			case 'role':
				return [{ role: direction }];
			case 'organizationName':
			case 'readonlyOrganizationNames':
			case 'editOrganizationNames':
				return [{ activeOrganization: { name: direction } }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ createdAt: 'desc' }];
		}
	}

	async get(actorUserId: string, userId: string): Promise<ServiceResult<UserPayload>> {
		try {
			const isAdminResult = await this.isAdmin(actorUserId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const user = await this.db.user.findUnique({
				where: { id: userId },
				include: {
					contact: true,
					activeOrganization: true,
					organizationAccesses: {
						select: {
							organizationId: true,
							permission: true,
						},
					},
				},
			});

			if (!user) {
				return this.resultFail('User not found');
			}

			const editOrganizationIds = user.organizationAccesses
				.filter((access) => access.permission === 'edit')
				.map((access) => access.organizationId);
			const readonlyOrganizationIds = user.organizationAccesses
				.filter((access) => access.permission === 'readonly')
				.map((access) => access.organizationId);

			return this.resultOk({
				id: user.id,
				firstName: user.contact.firstName,
				lastName: user.contact.lastName,
				email: user.contact.email,
				role: user.role,
				organizationId: user.activeOrganization?.id ?? null,
				editOrganizationIds,
				readonlyOrganizationIds,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch user: ${JSON.stringify(error)}`);
		}
	}

	async getOptions(actorUserId: string): Promise<ServiceResult<{ id: string; name: string }[]>> {
		try {
			const isAdminResult = await this.isAdmin(actorUserId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const organizations = await this.db.organization.findMany({
				select: { id: true, name: true },
				orderBy: { name: 'asc' },
			});

			return this.resultOk(organizations);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load user options: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableView(userId: string, query: UserTableQuery): Promise<ServiceResult<UserPaginatedTableView>> {
		try {
			const isAdminResult = await this.isAdmin(userId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const search = query.search.trim();
			const where = search
				? {
						OR: [
							{ id: { contains: search, mode: 'insensitive' as const } },
							{ contact: { firstName: { contains: search, mode: 'insensitive' as const } } },
							{ contact: { lastName: { contains: search, mode: 'insensitive' as const } } },
							{ contact: { email: { contains: search, mode: 'insensitive' as const } } },
							{ account: { firebaseAuthUserId: { contains: search, mode: 'insensitive' as const } } },
							{ activeOrganization: { name: { contains: search, mode: 'insensitive' as const } } },
							{
								organizationAccesses: {
									some: { organization: { name: { contains: search, mode: 'insensitive' as const } } },
								},
							},
						],
					}
				: undefined;

			const [users, totalCount] = await Promise.all([
				this.db.user.findMany({
					where,
					select: {
						id: true,
						role: true,
						createdAt: true,
						contact: {
							select: {
								firstName: true,
								lastName: true,
								email: true,
							},
						},
						account: {
							select: {
								firebaseAuthUserId: true,
							},
						},
						activeOrganization: {
							select: {
								name: true,
							},
						},
						organizationAccesses: {
							select: {
								permission: true,
								organization: {
									select: {
										name: true,
									},
								},
							},
						},
					},
					orderBy: this.buildUserOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.user.count({ where }),
			]);

			const tableRows: UserTableViewRow[] = users.map((user) => {
				const readonlyOrganizationNames = user.organizationAccesses
					.filter((access) => access.permission === 'readonly')
					.map((access) => access.organization.name)
					.sort((a, b) => a.localeCompare(b))
					.join(', ');
				const editOrganizationNames = user.organizationAccesses
					.filter((access) => access.permission === 'edit')
					.map((access) => access.organization.name)
					.sort((a, b) => a.localeCompare(b))
					.join(', ');

				return {
					id: user.id,
					firstName: user.contact?.firstName ?? null,
					lastName: user.contact?.lastName ?? null,
					email: user.contact?.email ?? null,
					firebaseAuthUserId: user.account.firebaseAuthUserId,
					role: user.role,
					organizationName: user.activeOrganization?.name ?? null,
					readonlyOrganizationNames,
					editOrganizationNames,
					createdAt: user.createdAt,
				};
			});

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch users: ${JSON.stringify(error)}`);
		}
	}

	async getCurrentUserSession(firebaseAuthUserId: string): Promise<ServiceResult<UserSession>> {
		try {
			const user = await this.db.user.findFirst({
				where: { account: { firebaseAuthUserId } },
				select: {
					id: true,
					role: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							email: true,
							gender: true,
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
					activeOrganization: {
						select: {
							id: true,
							name: true,
							programAccesses: {
								select: {
									program: { select: { id: true, name: true } },
								},
							},
						},
					},
					organizationAccesses: {
						select: {
							organization: { select: { id: true, name: true } },
						},
					},
				},
			});

			if (!user) {
				return this.resultFail('User not found');
			}

			const organizations = user.organizationAccesses.map((access) => ({
				id: access.organization.id,
				name: access.organization.name,
			}));

			const activeOrganization = user.activeOrganization
				? {
						id: user.activeOrganization.id,
						name: user.activeOrganization.name,
					}
				: null;

			const programs = user.activeOrganization
				? Array.from(
						new Map(
							user.activeOrganization.programAccesses.map((a) => [a.program.id, { id: a.program.id, name: a.program.name }]),
						).values(),
					)
				: [];

			const contact = user.contact;

			const session: UserSession = {
				type: 'user',
				id: user.id,
				role: user.role,
				firstName: contact?.firstName ?? null,
				lastName: contact?.lastName ?? null,
				email: contact?.email ?? null,
				gender: contact?.gender ?? null,
				language: contact?.language ?? null,
				street: contact?.address?.street ?? null,
				number: contact?.address?.number ?? null,
				city: contact?.address?.city ?? null,
				zip: contact?.address?.zip ?? null,
				country: contact?.address?.country ?? null,
				activeOrganization,
				organizations,
				programs,
			};

			return this.resultOk(session);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Error fetching user information: ${JSON.stringify(error)}`);
		}
	}

	async isAdmin(userId: string): Promise<ServiceResult<true>> {
		try {
			const user = await this.db.user.findUnique({
				where: { id: userId },
				select: { role: true },
			});

			if (!user) {
				return this.resultFail('User not found');
			}

			if (user.role !== UserRole.admin) {
				return this.resultFail('Permission denied');
			}

			return this.resultOk(true);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not check admin status: ${JSON.stringify(error)}`);
		}
	}
}
