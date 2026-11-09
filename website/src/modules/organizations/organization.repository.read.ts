import { Prisma, ProgramPermission } from '@/generated/prisma/client';
import { CountryCode } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { OrganizationMemberTableQuery, OrganizationTableQuery } from './organization.types';

export const findActiveOrganizationId = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { activeOrganizationId: true },
	});
	const activeOrganizationId = user?.activeOrganizationId ?? null;
	if (!activeOrganizationId) {
		return null;
	}

	const access = await prisma.organizationAccess.findUnique({
		where: {
			userId_organizationId: {
				userId,
				organizationId: activeOrganizationId,
			},
		},
		select: { organizationId: true },
	});

	return access?.organizationId ?? null;
};

export const findOrganizationSummary = async (organizationId: string) =>
	prisma.organization.findUnique({
		where: { id: organizationId },
		select: {
			id: true,
			name: true,
		},
	});

export const findPaginatedOrganizationMembers = async (organizationId: string, query: OrganizationMemberTableQuery) => {
	const search = query.search.trim();
	const where: Prisma.OrganizationAccessWhereInput = {
		organizationId,
		...(search
			? {
					user: {
						OR: [
							{ id: { contains: search, mode: 'insensitive' } },
							{
								contact: {
									OR: [
										{ firstName: { contains: search, mode: 'insensitive' } },
										{ lastName: { contains: search, mode: 'insensitive' } },
										{ email: { contains: search, mode: 'insensitive' } },
									],
								},
							},
						],
					},
				}
			: {}),
	};

	const [members, totalCount] = await Promise.all([
		prisma.organizationAccess.findMany({
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
			},
			orderBy: buildOrganizationMemberOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.organizationAccess.count({ where }),
	]);

	return { members, totalCount };
};

export const findPaginatedOrganizations = async (query: OrganizationTableQuery) => {
	const search = query.search.trim();
	const where: Prisma.OrganizationWhereInput | undefined = search
		? {
				OR: [{ id: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }],
			}
		: undefined;

	const [organizations, totalCount] = await Promise.all([
		prisma.organization.findMany({
			where,
			select: {
				id: true,
				name: true,
				createdAt: true,
				organizationAccesses: {
					select: {
						id: true,
					},
				},
				programAccesses: {
					select: {
						programId: true,
						permission: true,
					},
				},
			},
			orderBy: buildOrganizationOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.organization.count({ where }),
	]);

	return { organizations, totalCount };
};

export const findOrganizationOptions = async () =>
	prisma.organization.findMany({
		select: { id: true, name: true },
		orderBy: { name: 'asc' },
	});

export const findOperatorFallbackOrganization = async (countryCode: CountryCode) =>
	prisma.organization.findFirst({
		where: { operatorFallbackCountryCode: countryCode },
		select: { id: true },
	});

export const findOrganizationCountryOptions = async () =>
	prisma.country.findMany({
		select: { isoCode: true },
		orderBy: { isoCode: 'asc' },
	});

export const findOrganizationByOperatorFallbackCountry = async (countryCode: CountryCode, excludeOrganizationId?: string) =>
	prisma.organization.findFirst({
		where: {
			operatorFallbackCountryCode: countryCode,
			...(excludeOrganizationId ? { id: { not: excludeOrganizationId } } : {}),
		},
		select: { id: true },
	});

export const findOrganizationsByIds = async (organizationIds: string[]) =>
	prisma.organization.findMany({
		where: { id: { in: organizationIds } },
		select: { id: true },
	});

export const findOrganizationById = async (organizationId: string) =>
	prisma.organization.findUnique({
		where: { id: organizationId },
		select: {
			id: true,
			name: true,
			operatorFallbackCountryCode: true,
			organizationAccesses: {
				select: {
					userId: true,
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

export const findOrganizationUserOptions = async () =>
	prisma.user.findMany({
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

export const findOrganizationByName = async (name: string) =>
	prisma.organization.findUnique({
		where: { name },
		select: { id: true },
	});

export const findUsersByIds = async (userIds: string[]) =>
	prisma.user.findMany({
		where: { id: { in: userIds } },
		select: { id: true },
	});

export const findOrganizationIdentity = async (organizationId: string) =>
	prisma.organization.findUnique({
		where: { id: organizationId },
		select: { id: true, name: true },
	});

export const findOperatorProgramAccess = async (organizationId: string) =>
	prisma.programAccess.findFirst({
		where: {
			organizationId,
			permission: ProgramPermission.operator,
		},
		select: { id: true },
	});

export const findOrganizationUsageCounts = async (organizationId: string) => {
	const [activeUsersCount, expensesCount, programAccessesCount] = await Promise.all([
		prisma.user.count({ where: { activeOrganizationId: organizationId } }),
		prisma.expense.count({ where: { organizationId } }),
		prisma.programAccess.count({ where: { organizationId } }),
	]);

	return { activeUsersCount, expensesCount, programAccessesCount };
};

const buildOrganizationOrderBy = (query: OrganizationTableQuery): Prisma.OrganizationOrderByWithRelationInput[] => {
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
};

const buildOrganizationMemberOrderBy = (
	query: OrganizationMemberTableQuery,
): Prisma.OrganizationAccessOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, ['id', 'member', 'email', 'role'] as const);

	switch (sortBy) {
		case 'id':
			return [{ user: { id: direction } }];
		case 'member':
			return [{ user: { contact: { firstName: direction } } }, { user: { contact: { lastName: direction } } }];
		case 'email':
			return [{ user: { contact: { email: direction } } }];
		case 'role':
			return [{ user: { role: direction } }];
		default:
			return [{ user: { contact: { firstName: 'asc' } } }];
	}
};
