import { OrganizationPermission, Prisma, ProgramPermission } from '@/generated/prisma/client';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { UserReadService } from '../user/user-read.service';
import {
	OrganizationMemberPaginatedTableView,
	OrganizationMemberTableQuery,
	OrganizationMemberTableView,
	OrganizationMemberTableViewRow,
	OrganizationOption,
	OrganizationPaginatedTableView,
	OrganizationTableQuery,
	OrganizationTableView,
	OrganizationTableViewRow,
} from './organization.types';

export class OrganizationReadService extends BaseService {
	private userService = new UserReadService();
	private organizationAccessService = new OrganizationAccessService();

	private buildOrganizationOrderBy(query: OrganizationTableQuery): Prisma.OrganizationOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, ['id', 'name', 'usersCount', 'createdAt'] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'name':
				return [{ name: direction }];
			case 'usersCount':
				return [{ organizationAccesses: { _count: direction } }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ name: 'asc' }];
		}
	}

	private buildOrganizationMemberOrderBy(
		query: OrganizationMemberTableQuery,
	): Prisma.OrganizationAccessOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, ['id', 'member', 'email', 'role', 'permission'] as const);
		switch (sortBy) {
			case 'id':
				return [{ user: { id: direction } }];
			case 'member':
				return [{ user: { contact: { firstName: direction } } }, { user: { contact: { lastName: direction } } }];
			case 'email':
				return [{ user: { contact: { email: direction } } }];
			case 'role':
				return [{ user: { role: direction } }];
			case 'permission':
				return [{ permission: direction }];
			default:
				return [{ user: { contact: { firstName: 'asc' } } }];
		}
	}

	async getOrganizationMembersTableView(userId: string): Promise<ServiceResult<OrganizationMemberTableView>> {
		const paginated = await this.getPaginatedOrganizationMembersTableView(userId, {
			page: 1,
			pageSize: 10_000,
			search: '',
		});
		if (!paginated.success) {
			return this.resultFail(paginated.error);
		}
		return this.resultOk({ tableRows: paginated.data.tableRows });
	}

	async getPaginatedOrganizationMembersTableView(
		userId: string,
		query: OrganizationMemberTableQuery,
	): Promise<ServiceResult<OrganizationMemberPaginatedTableView>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const { id: organizationId } = activeOrgResult.data;
			const search = query.search.trim();
			const where = {
				organizationId,
				...(search
					? {
							user: {
								contact: {
									OR: [
										{ firstName: { contains: search, mode: 'insensitive' as const } },
										{ lastName: { contains: search, mode: 'insensitive' as const } },
										{ email: { contains: search, mode: 'insensitive' as const } },
									],
								},
							},
						}
					: {}),
			};

			const [members, totalCount] = await Promise.all([
				this.db.organizationAccess.findMany({
					where,
					select: {
						user: {
							select: {
								id: true,
								role: true,
								contact: {
									select: {
										firstName: true,
										lastName: true,
										email: true,
									},
								},
							},
						},
						permission: true,
					},
					orderBy: this.buildOrganizationMemberOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.organizationAccess.count({ where }),
			]);

			const tableRows: OrganizationMemberTableViewRow[] = members.map((member) => ({
				id: member.user.id,
				firstName: member.user.contact?.firstName ?? '',
				lastName: member.user.contact?.lastName ?? '',
				email: member.user.contact?.email ?? '',
				role: member.user.role ?? null,
				permission: member.permission ?? OrganizationPermission.readonly,
			}));

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch organization members: ${JSON.stringify(error)}`);
		}
	}

	async getAdminTableView(userId: string): Promise<ServiceResult<OrganizationTableView>> {
		const paginated = await this.getPaginatedAdminTableView(userId, {
			page: 1,
			pageSize: 10_000,
			search: '',
		});
		if (!paginated.success) {
			return this.resultFail(paginated.error);
		}
		return this.resultOk({ tableRows: paginated.data.tableRows });
	}

	async getPaginatedAdminTableView(
		userId: string,
		query: OrganizationTableQuery,
	): Promise<ServiceResult<OrganizationPaginatedTableView>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}
			const search = query.search.trim();
			const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : undefined;

			const [organizations, totalCount] = await Promise.all([
				this.db.organization.findMany({
					where,
					select: {
						id: true,
						name: true,
						createdAt: true,
						_count: {
							select: {
								organizationAccesses: true,
							},
						},
						programAccesses: {
							select: {
								permission: true,
							},
						},
					},
					orderBy: this.buildOrganizationOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.organization.count({ where }),
			]);

			const tableRows: OrganizationTableViewRow[] = organizations.map((organization) => {
				const ownedProgramsCount = organization.programAccesses.filter((pa) => pa.permission === ProgramPermission.owner).length;
				const operatedProgramsCount = organization.programAccesses.filter(
					(pa) => pa.permission === ProgramPermission.operator,
				).length;

				return {
					id: organization.id,
					name: organization.name,
					ownedProgramsCount,
					operatedProgramsCount,
					usersCount: organization._count.organizationAccesses,
					createdAt: organization.createdAt,
				};
			});

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch organizations: ${JSON.stringify(error)}`);
		}
	}

	async getOptions(userId: string): Promise<ServiceResult<OrganizationOption[]>> {
		const isAdminResult = await this.userService.isAdmin(userId);
		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const organizations = await this.db.organization.findMany({
				select: { id: true, name: true },
				orderBy: { name: 'asc' },
			});
			return this.resultOk(organizations);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch organizations: ${JSON.stringify(error)}`);
		}
	}
}
