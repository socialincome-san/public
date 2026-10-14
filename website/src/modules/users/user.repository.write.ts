import type { Prisma } from '@/generated/prisma/client';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, type AuditedEntity } from '@/lib/audit/audited-write';
import type { CreateUserInput, UpdateUserInput, UpdateUserSelfInput } from './user.schemas';

// Every write here stores a user audit event in the same transaction.
// Organization accesses belong to the user. Reads live in
// user.repository.read.ts.

export const createUser = async (
	audit: AuditContext,
	input: CreateUserInput,
	firebaseAuthUserId: string,
	activeOrganizationId: string,
) =>
	auditedWrite({ entity: userEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.user.create({
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
		}),
	);

export const updateUser = async (audit: AuditContext, input: UpdateUserInput, activeOrganizationId: string | null) =>
	auditedWrite({ entity: userEntity, context: audit, action: 'update', entityId: input.id }, (transaction) =>
		transaction.user.update({
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
		}),
	);

export const updateUserSelf = async (
	audit: AuditContext,
	userId: string,
	input: UpdateUserSelfInput,
	activeOrganizationId: string | undefined,
) =>
	auditedWrite({ entity: userEntity, context: audit, action: 'update', entityId: userId }, (transaction) =>
		transaction.user.update({
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
		}),
	);

export const deleteUser = async (audit: AuditContext, userId: string) =>
	auditedWrite({ entity: userEntity, context: audit, action: 'delete', entityId: userId }, async (transaction) => {
		const user = await transaction.user.findUniqueOrThrow({
			where: { id: userId },
			select: { contactId: true, accountId: true },
		});
		await transaction.organizationAccess.deleteMany({ where: { userId } });
		await transaction.user.delete({ where: { id: userId } });
		await transaction.contact.delete({ where: { id: user.contactId } });
		await transaction.account.delete({ where: { id: user.accountId } });
	});

/**
 * Replaces the members of an organization. Members who lose their active
 * organization fall back to their oldest remaining one. `userIds` are all
 * users whose accesses change.
 */
export const updateOrganizationMembers = async (
	audit: AuditContext,
	userIds: string[],
	input: { organizationId: string; memberIds: string[] },
) =>
	auditedWrite({ entity: userEntity, context: audit, action: 'update', entityId: userIds }, async (transaction) => {
		await transaction.organizationAccess.deleteMany({ where: { organizationId: input.organizationId } });
		const accesses = [...new Set(input.memberIds)].map((userId) => ({ userId, organizationId: input.organizationId }));
		if (accesses.length > 0) {
			await transaction.organizationAccess.createMany({ data: accesses });
		}

		const removedUsers = await transaction.user.findMany({
			where: { activeOrganizationId: input.organizationId, id: { in: userIds, notIn: input.memberIds } },
			select: { id: true },
		});
		for (const { id } of removedUsers) {
			const remainingAccess = await transaction.organizationAccess.findFirst({
				where: { userId: id },
				select: { organizationId: true },
				orderBy: { createdAt: 'asc' },
			});
			await transaction.user.update({
				where: { id },
				data: { activeOrganizationId: remainingAccess?.organizationId ?? null },
			});
		}
	});

// The contact with its phone and address, the account and the organization
// accesses belong to the user's snapshot.
const userAuditSnapshotSelect = {
	role: true,
	activeOrganizationId: true,
	account: { select: { firebaseAuthUserId: true } },
	organizationAccesses: { select: { organizationId: true }, orderBy: { organizationId: 'asc' } },
	contact: {
		select: {
			firstName: true,
			lastName: true,
			callingName: true,
			email: true,
			gender: true,
			language: true,
			dateOfBirth: true,
			profession: true,
			isInstitution: true,
			phone: { select: { number: true, hasWhatsApp: true } },
			address: { select: { street: true, number: true, city: true, zip: true, country: true } },
		},
	},
} satisfies Prisma.UserSelect;

const userEntity: AuditedEntity = {
	type: 'user',
	findSnapshot: (transaction, userId) =>
		transaction.user.findUnique({ where: { id: userId }, select: userAuditSnapshotSelect }),
};

const getAccessRows = (organizationIds: string[]) =>
	Array.from(new Set(organizationIds)).map((organizationId) => ({ organizationId }));
