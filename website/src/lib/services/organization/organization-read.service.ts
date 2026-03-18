import { OrganizationPermission, Prisma, PrismaClient, ProgramPermission } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { OrganizationAccessService } from '../organization-access/organization-access.service';
import { UserReadService } from '../user/user-read.service';
import {
	ActiveOrganizationSummary,
	OrganizationMemberPaginatedTableView,
	OrganizationMemberTableQuery,
	OrganizationMemberTableView,
	OrganizationMemberTableViewRow,
	OrganizationOption,
	OrganizationPaginatedTableView,
	OrganizationPayload,
	OrganizationTableQuery,
	OrganizationTableView,
	OrganizationTableViewRow,
} from './organization.types';

export class OrganizationReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		private readonly organizationAccessService: OrganizationAccessService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private buildOrganizationOrderBy(query: OrganizationTableQuery): Prisma.OrganizationOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, ['id', 'name', 'readonlyUsersCount', 'writeUsersCount', 'createdAt'] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'name':
				return [{ name: direction }];
			case 'readonlyUsersCount':
			case 'writeUsersCount':
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
		try {
			const paginated = await this.getPaginatedOrganizationMembersTableView(userId, {
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

			return this.resultFail(`Could not fetch organization members table view: ${JSON.stringify(error)}`);
		}
	}

	async getActiveOrganizationSummary(userId: string): Promise<ServiceResult<ActiveOrganizationSummary>> {
		try {
			const activeOrgResult = await this.organizationAccessService.getActiveOrganizationAccess(userId);
			if (!activeOrgResult.success) {
				return this.resultFail(activeOrgResult.error);
			}

			const organization = await this.db.organization.findUnique({
				where: { id: activeOrgResult.data.id },
				select: {
					id: true,
					name: true,
				},
			});
			if (!organization) {
				return this.resultFail('Organization not found');
			}

			return this.resultOk({
				id: organization.id,
				name: organization.name,
				permission: activeOrgResult.data.permission,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch active organization summary: ${JSON.stringify(error)}`);
		}
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
								OR: [
									{ id: { contains: search, mode: 'insensitive' as const } },
									{
										contact: {
											OR: [
												{ firstName: { contains: search, mode: 'insensitive' as const } },
												{ lastName: { contains: search, mode: 'insensitive' as const } },
												{ email: { contains: search, mode: 'insensitive' as const } },
											],
										},
									},
								],
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
		try {
			const paginated = await this.getPaginatedAdminTableView(userId, {
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

			return this.resultFail(`Could not fetch organizations table view: ${JSON.stringify(error)}`);
		}
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
			const where = search
				? {
						OR: [
							{ id: { contains: search, mode: 'insensitive' as const } },
							{ name: { contains: search, mode: 'insensitive' as const } },
						],
					}
				: undefined;

			const [organizations, totalCount] = await Promise.all([
				this.db.organization.findMany({
					where,
					select: {
						id: true,
						name: true,
						createdAt: true,
						organizationAccesses: {
							select: {
								permission: true,
							},
						},
						programAccesses: {
							select: {
								programId: true,
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
				const ownedProgramsCount = organization.programAccesses.filter(
					(pa) => pa.permission === ProgramPermission.owner,
				).length;
				const operatedProgramsCount = organization.programAccesses.filter(
					(pa) => pa.permission === ProgramPermission.operator,
				).length;
				const readonlyUsersCount = organization.organizationAccesses.filter(
					(access) => access.permission === OrganizationPermission.readonly,
				).length;
				const writeUsersCount = organization.organizationAccesses.filter(
					(access) => access.permission === OrganizationPermission.edit,
				).length;

				return {
					id: organization.id,
					name: organization.name,
					ownedProgramsCount,
					operatedProgramsCount,
					readonlyUsersCount,
					writeUsersCount,
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
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
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

			return this.resultFail(`Could not fetch organizations: ${JSON.stringify(error)}`);
		}
	}

	async get(userId: string, organizationId: string): Promise<ServiceResult<OrganizationPayload>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const organization = await this.db.organization.findUnique({
				where: { id: organizationId },
				select: {
					id: true,
					name: true,
					organizationAccesses: {
						select: {
							userId: true,
							permission: true,
						},
					},
					programAccesses: {
						select: {
							programId: true,
							permission: true,
						},
					},
				},
			});
			if (!organization) {
				return this.resultFail('Organization not found');
			}

			return this.resultOk({
				id: organization.id,
				name: organization.name,
				editUserIds: organization.organizationAccesses
					.filter((access) => access.permission === OrganizationPermission.edit)
					.map((access) => access.userId),
				readonlyUserIds: organization.organizationAccesses
					.filter((access) => access.permission === OrganizationPermission.readonly)
					.map((access) => access.userId),
				ownedProgramIds: organization.programAccesses
					.filter((access) => access.permission === ProgramPermission.owner)
					.map((access) => access.programId),
				operatedProgramIds: organization.programAccesses
					.filter((access) => access.permission === ProgramPermission.operator)
					.map((access) => access.programId),
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch organization: ${JSON.stringify(error)}`);
		}
	}

	async getUserOptions(userId: string): Promise<ServiceResult<{ id: string; name: string }[]>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const users = await this.db.user.findMany({
				select: {
					id: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
				},
				orderBy: [{ contact: { firstName: 'asc' } }, { contact: { lastName: 'asc' } }],
			});

			return this.resultOk(
				users.map((user) => ({
					id: user.id,
					name: `${user.contact.firstName} ${user.contact.lastName}`.trim(),
				})),
			);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch organization users: ${JSON.stringify(error)}`);
		}
	}

	async getProgramOptions(userId: string): Promise<ServiceResult<{ id: string; name: string }[]>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const programs = await this.db.program.findMany({
				select: {
					id: true,
					name: true,
				},
				orderBy: { name: 'asc' },
			});

			return this.resultOk(programs);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch organization programs: ${JSON.stringify(error)}`);
		}
	}
}
