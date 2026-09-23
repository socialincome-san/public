import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { CreateUserInput, UpdateUserInput, UpdateUserSelfInput } from './user.schemas';
import type { UserTableQuery } from './user.types';

export const findUserStripeCheckoutContext = async (userId: string) =>
	prisma.user.findUnique({
		where: { id: userId },
		select: {
			accountId: true,
			contactId: true,
			contact: {
				select: { email: true, firstName: true, lastName: true },
			},
		},
	});

export const findUserContactIdByAccountId = async (accountId: string) =>
	prisma.user.findUnique({
		where: { accountId },
		select: { contactId: true },
	});

export const findUserById = async (userId: string) =>
	prisma.user.findUnique({
		where: { id: userId },
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
			activeOrganization: {
				select: { id: true },
			},
			organizationAccesses: {
				select: { organizationId: true },
			},
		},
	});

export const findOrganizationOptions = async () =>
	prisma.organization.findMany({
		select: { id: true, name: true },
		orderBy: { name: 'asc' },
	});

export const findPaginatedUsers = async (query: UserTableQuery) => {
	const search = query.search.trim();
	const where: Prisma.UserWhereInput | undefined = search
		? {
				OR: [
					{ id: { contains: search, mode: 'insensitive' } },
					{ contact: { firstName: { contains: search, mode: 'insensitive' } } },
					{ contact: { lastName: { contains: search, mode: 'insensitive' } } },
					{ contact: { email: { contains: search, mode: 'insensitive' } } },
					{ account: { firebaseAuthUserId: { contains: search, mode: 'insensitive' } } },
					{ activeOrganization: { name: { contains: search, mode: 'insensitive' } } },
					{
						organizationAccesses: {
							some: { organization: { name: { contains: search, mode: 'insensitive' } } },
						},
					},
				],
			}
		: undefined;

	const [users, totalCount] = await Promise.all([
		prisma.user.findMany({
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
						organization: {
							select: {
								name: true,
							},
						},
					},
				},
			},
			orderBy: buildUserOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.user.count({ where }),
	]);

	return { users, totalCount };
};

export const findUserSessionByFirebaseAuthUserId = async (firebaseAuthUserId: string) =>
	prisma.user.findFirst({
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
							permission: true,
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

export const findUserRole = async (userId: string) =>
	prisma.user.findUnique({
		where: { id: userId },
		select: { role: true },
	});

export const findActiveOrganizationIdByUserId = async (userId: string) =>
	prisma.user.findUnique({
		where: { id: userId },
		select: { activeOrganizationId: true },
	});

export const findContactByEmail = async (email: string) =>
	prisma.contact.findUnique({
		where: { email },
		select: { id: true },
	});

export const createUser = async (input: CreateUserInput, firebaseAuthUserId: string, activeOrganizationId: string) =>
	prisma.user.create({
		data: {
			role: input.role,
			activeOrganization: {
				connect: {
					id: activeOrganizationId,
				},
			},
			contact: {
				create: {
					firstName: input.firstName,
					lastName: input.lastName,
					email: input.email,
				},
			},
			account: {
				create: {
					firebaseAuthUserId,
				},
			},
			organizationAccesses: {
				createMany: {
					data: getAccessRows(input.organizationIds),
				},
			},
		},
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
			activeOrganization: {
				select: { id: true },
			},
		},
	});

export const findUserForUpdate = async (userId: string) =>
	prisma.user.findUnique({
		where: { id: userId },
		select: {
			activeOrganizationId: true,
			contact: {
				select: {
					id: true,
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
		},
	});

export const updateUser = async (input: UpdateUserInput, activeOrganizationId: string | null) =>
	prisma.user.update({
		where: { id: input.id },
		data: {
			role: input.role,
			activeOrganization: activeOrganizationId ? { connect: { id: activeOrganizationId } } : undefined,
			contact: {
				update: {
					firstName: input.firstName,
					lastName: input.lastName,
					email: input.email,
				},
			},
			organizationAccesses: {
				deleteMany: { userId: input.id },
				createMany: {
					data: getAccessRows(input.organizationIds),
				},
			},
		},
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
			activeOrganization: {
				select: { id: true },
			},
		},
	});

export const findUserForSelfUpdate = async (userId: string) =>
	prisma.user.findUnique({
		where: { id: userId },
		select: {
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
			organizationAccesses: {
				select: { organizationId: true },
			},
		},
	});

export const updateUserSelf = async (userId: string, input: UpdateUserSelfInput, activeOrganizationId: string | undefined) =>
	prisma.user.update({
		where: { id: userId },
		data: {
			activeOrganization: activeOrganizationId ? { connect: { id: activeOrganizationId } } : undefined,
			contact: {
				update: {
					firstName: input.firstName,
					lastName: input.lastName,
					gender: input.gender,
					language: input.language,
					address: input.address
						? {
								upsert: {
									update: input.address,
									create: input.address,
								},
							}
						: undefined,
				},
			},
		},
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
			activeOrganization: {
				select: { id: true },
			},
			organizationAccesses: {
				select: {
					organizationId: true,
				},
			},
		},
	});

export const findUserForDeletion = async (userId: string) =>
	prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			accountId: true,
			contactId: true,
			account: {
				select: {
					firebaseAuthUserId: true,
				},
			},
		},
	});

export const deleteUserData = async (userId: string, contactId: string, accountId: string) =>
	prisma.$transaction(async (transaction) => {
		await transaction.organizationAccess.deleteMany({
			where: { userId },
		});
		await transaction.user.delete({
			where: { id: userId },
		});
		await transaction.contact.delete({
			where: { id: contactId },
		});
		await transaction.account.delete({
			where: { id: accountId },
		});
	});

const getAccessRows = (organizationIds: string[]) =>
	Array.from(new Set(organizationIds)).map((organizationId) => ({ organizationId }));

const buildUserOrderBy = (query: UserTableQuery): Prisma.UserOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, [
		'id',
		'user',
		'email',
		'role',
		'organizationName',
		'organizationNames',
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
		case 'organizationNames':
			return [{ activeOrganization: { name: direction } }];
		case 'createdAt':
			return [{ createdAt: direction }];
		default:
			return [{ createdAt: 'desc' }];
	}
};
