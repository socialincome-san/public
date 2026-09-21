import { Prisma, ProgramPermission } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { CreateOrganizationInput, UpdateOrganizationInput } from './organization.schemas';
import type { OrganizationMemberTableQuery, OrganizationTableQuery } from './organization.types';

export const findActiveOrganizationId = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { activeOrganizationId: true },
	});

	return user?.activeOrganizationId ?? null;
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

export const findOperatorFallbackOrganization = async () =>
	prisma.organization.findFirst({
		where: { isOperatorFallback: true },
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

export const createOrganizationFromEmail = async (email: string) =>
	prisma.organization.create({
		data: {
			name: `${email.toLowerCase().trim()} organization`,
		},
		select: {
			id: true,
			name: true,
		},
	});

export const createOrganization = async (input: CreateOrganizationInput) =>
	prisma.$transaction(async (transaction) => {
		const organization = await transaction.organization.create({
			data: {
				name: input.name,
			},
			select: {
				id: true,
				name: true,
			},
		});

		const organizationAccesses = buildOrganizationAccessRows(organization.id, input.userIds);
		if (organizationAccesses.length > 0) {
			await transaction.organizationAccess.createMany({ data: organizationAccesses });
		}

		const programAccesses = buildProgramAccessRows(organization.id, input.ownedProgramIds, input.operatedProgramIds);
		if (programAccesses.length > 0) {
			await transaction.programAccess.createMany({ data: programAccesses });
		}

		return organization;
	});

export const findOrganizationIdentity = async (organizationId: string) =>
	prisma.organization.findUnique({
		where: { id: organizationId },
		select: { id: true, name: true },
	});

export const updateOrganization = async (input: UpdateOrganizationInput) =>
	prisma.$transaction(async (transaction) => {
		const organization = await transaction.organization.update({
			where: { id: input.id },
			data: { name: input.name },
			select: { id: true, name: true },
		});

		await transaction.organizationAccess.deleteMany({
			where: { organizationId: input.id },
		});
		const organizationAccesses = buildOrganizationAccessRows(input.id, input.userIds);
		if (organizationAccesses.length > 0) {
			await transaction.organizationAccess.createMany({ data: organizationAccesses });
		}

		await transaction.programAccess.deleteMany({
			where: { organizationId: input.id },
		});
		const programAccesses = buildProgramAccessRows(input.id, input.ownedProgramIds, input.operatedProgramIds);
		if (programAccesses.length > 0) {
			await transaction.programAccess.createMany({ data: programAccesses });
		}

		return organization;
	});

export const findOperatorProgramAccess = async (organizationId: string) =>
	prisma.programAccess.findFirst({
		where: {
			organizationId,
			permission: ProgramPermission.operator,
		},
		select: { id: true },
	});

export const updateOrganizationName = async (organizationId: string, name: string) =>
	prisma.organization.update({
		where: { id: organizationId },
		data: { name },
		select: { id: true, name: true },
	});

export const findOrganizationUsageCounts = async (organizationId: string) => {
	const [activeUsersCount, expensesCount, programAccessesCount] = await Promise.all([
		prisma.user.count({ where: { activeOrganizationId: organizationId } }),
		prisma.expense.count({ where: { organizationId } }),
		prisma.programAccess.count({ where: { organizationId } }),
	]);

	return { activeUsersCount, expensesCount, programAccessesCount };
};

export const deleteOrganization = async (organizationId: string) =>
	prisma.$transaction(async (transaction) => {
		await transaction.organizationAccess.deleteMany({
			where: { organizationId },
		});
		await transaction.organization.delete({
			where: { id: organizationId },
		});
	});

const buildOrganizationAccessRows = (organizationId: string, userIds: string[]) =>
	Array.from(new Set(userIds)).map((userId) => ({
		organizationId,
		userId,
	}));

const buildProgramAccessRows = (organizationId: string, ownedProgramIds: string[], operatedProgramIds: string[]) => [
	...Array.from(new Set(ownedProgramIds)).map((programId) => ({
		organizationId,
		programId,
		permission: ProgramPermission.owner,
	})),
	...Array.from(new Set(operatedProgramIds)).map((programId) => ({
		organizationId,
		programId,
		permission: ProgramPermission.operator,
	})),
];

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
