import type { Prisma } from '@/generated/prisma/client';
import { ContributorReferralSource } from '@/generated/prisma/enums';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, defineAuditedEntity } from '@/lib/audit/audited-write';
import { contributorRecordSelect, contributorWithContactSelect } from './contributor.repository.read';
import type { CreateContributorInput, UpdateContributorInput, UpdateContributorSelfInput } from './contributor.schemas';

// Every write here stores a contributor audit event in the same transaction.
// Reads live in contributor.repository.read.ts.

export const createContributor = async (audit: AuditContext, input: CreateContributorInput, firebaseAuthUserId: string) =>
	auditedWrite({ entity: contributorEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.contributor.create({
			data: {
				referral: input.referral,
				paymentReferenceId: input.paymentReferenceId,
				stripeCustomerId: input.stripeCustomerId,
				account: {
					create: {
						firebaseAuthUserId,
					},
				},
				contact: {
					create: buildContactCreateData(input),
				},
			},
			select: contributorRecordSelect,
		}),
	);

export const createContributorForAccount = async (
	audit: AuditContext,
	accountId: string,
	stripeCustomerId: string,
	contactId: string,
) =>
	auditedWrite({ entity: contributorEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.contributor.create({
			data: {
				account: { connect: { id: accountId } },
				contact: { connect: { id: contactId } },
				stripeCustomerId,
				referral: ContributorReferralSource.other,
				needsOnboarding: false,
			},
			select: contributorWithContactSelect,
		}),
	);

export const createContributorFromStripeData = async (
	audit: AuditContext,
	input: {
		stripeCustomerId: string;
		email: string;
		firstName: string;
		lastName: string;
		referral: CreateContributorInput['referral'];
	},
	firebaseAuthUserId: string,
) =>
	auditedWrite({ entity: contributorEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.contributor.create({
			data: {
				stripeCustomerId: input.stripeCustomerId,
				referral: input.referral,
				account: {
					create: {
						firebaseAuthUserId,
					},
				},
				contact: {
					create: {
						firstName: input.firstName,
						lastName: input.lastName,
						email: input.email,
					},
				},
			},
			select: contributorWithContactSelect,
		}),
	);

export const createContributorFromBankData = async (
	audit: AuditContext,
	input: {
		paymentReferenceId: string;
		email: string;
		firstName: string;
		lastName: string;
		language: string;
	},
	firebaseAuthUserId: string,
) =>
	auditedWrite({ entity: contributorEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.contributor.create({
			data: {
				paymentReferenceId: input.paymentReferenceId,
				referral: ContributorReferralSource.other,
				account: {
					create: {
						firebaseAuthUserId,
					},
				},
				contact: {
					create: {
						firstName: input.firstName,
						lastName: input.lastName,
						email: input.email,
						language: input.language,
					},
				},
			},
			select: contributorWithContactSelect,
		}),
	);

export const createContributorFromEmailAndName = async (
	audit: AuditContext,
	input: { email: string; firstName: string; lastName: string },
	firebaseAuthUserId: string,
) =>
	auditedWrite({ entity: contributorEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.contributor.create({
			data: {
				referral: ContributorReferralSource.other,
				account: {
					create: {
						firebaseAuthUserId,
					},
				},
				contact: {
					create: {
						firstName: input.firstName,
						lastName: input.lastName,
						email: input.email,
					},
				},
			},
			select: contributorWithContactSelect,
		}),
	);

export const updateContributor = async (
	audit: AuditContext,
	input: UpdateContributorInput,
	context: {
		contactId: string;
		phoneId: string | undefined;
		phoneNumber: string | undefined;
		addressId: string | undefined;
	},
) =>
	auditedWrite({ entity: contributorEntity, context: audit, action: 'update', entityId: input.id }, async (transaction) => {
		const relations = await findRelationIds(transaction, input.id);
		const contributor = await transaction.contributor.update({
			where: { id: input.id },
			data: {
				referral: input.referral,
				paymentReferenceId: input.paymentReferenceId,
				stripeCustomerId: input.stripeCustomerId,
				contact: {
					update: {
						where: { id: context.contactId },
						data: buildContactUpdateData(input, context),
					},
				},
			},
			select: contributorRecordSelect,
		});
		await deleteOrphanedRelations(transaction, relations);

		return contributor;
	});

export const updateContributorSelf = async (
	audit: AuditContext,
	contributorId: string,
	input: UpdateContributorSelfInput,
	contactId: string,
	addressId: string | undefined,
) =>
	auditedWrite({ entity: contributorEntity, context: audit, action: 'update', entityId: contributorId }, (transaction) =>
		transaction.contributor.update({
			where: { id: contributorId },
			data: {
				referral: input.referral,
				needsOnboarding: input.needsOnboarding,
				paymentReferenceId: input.paymentReferenceId,
				contact: {
					update: {
						where: { id: contactId },
						data: {
							firstName: input.contact.firstName,
							lastName: input.contact.lastName,
							email: input.contact.email,
							gender: input.contact.gender,
							language: input.contact.language,
							address: buildSelfAddressUpdateOperation(input.contact.address, addressId),
						},
					},
				},
			},
			select: contributorRecordSelect,
		}),
	);

export const updateContributorStripeCustomerId = async (
	audit: AuditContext,
	contributorId: string,
	stripeCustomerId: string,
) =>
	auditedWrite({ entity: contributorEntity, context: audit, action: 'update', entityId: contributorId }, (transaction) =>
		transaction.contributor.update({
			where: { id: contributorId },
			data: { stripeCustomerId },
			select: contributorWithContactSelect,
		}),
	);

// The contact, its phone and address and the account belong to the
// contributor's snapshot.
const contributorAuditSnapshotSelect = {
	legacyFirestoreId: true,
	referral: true,
	needsOnboarding: true,
	paymentReferenceId: true,
	stripeCustomerId: true,
	account: { select: { firebaseAuthUserId: true } },
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
} satisfies Prisma.ContributorSelect;

const contributorEntity = defineAuditedEntity({
	type: 'contributor',
	findSnapshot: (transaction, contributorId) =>
		transaction.contributor.findUnique({ where: { id: contributorId }, select: contributorAuditSnapshotSelect }),
	getName: ({ contact }) => `${contact.firstName} ${contact.lastName}`,
});

const findRelationIds = async (transaction: Prisma.TransactionClient, contributorId: string) => {
	const contributor = await transaction.contributor.findUniqueOrThrow({
		where: { id: contributorId },
		select: { contact: { select: { phoneId: true, addressId: true } } },
	});

	return contributor.contact;
};

// Phones and addresses can be shared, so only rows nothing references
// anymore are deleted.
const deleteOrphanedRelations = async (
	transaction: Prisma.TransactionClient,
	{ phoneId, addressId }: { phoneId: string | null; addressId: string | null },
) => {
	if (phoneId) {
		await transaction.phone.deleteMany({
			where: { id: phoneId, contacts: { none: {} }, paymentInformations: { none: {} } },
		});
	}
	if (addressId) {
		await transaction.address.deleteMany({ where: { id: addressId, contacts: { none: {} } } });
	}
};

const buildContactCreateData = (input: CreateContributorInput): Prisma.ContactCreateWithoutContributorInput => {
	const address = buildAddressData(input.contact);

	return {
		firstName: input.contact.firstName,
		lastName: input.contact.lastName,
		callingName: input.contact.callingName,
		email: input.contact.email,
		gender: input.contact.gender,
		language: input.contact.language,
		dateOfBirth: input.contact.dateOfBirth,
		profession: input.contact.profession,
		phone: input.contact.phone
			? {
					create: {
						number: input.contact.phone,
						hasWhatsApp: input.contact.hasWhatsApp,
					},
				}
			: undefined,
		address: address ? { create: address } : undefined,
	};
};

const buildContactUpdateData = (
	input: UpdateContributorInput,
	context: {
		phoneId: string | undefined;
		phoneNumber: string | undefined;
		addressId: string | undefined;
	},
): Prisma.ContactUpdateWithoutContributorInput => {
	const address = buildAddressData(input.contact);

	return {
		firstName: input.contact.firstName,
		lastName: input.contact.lastName,
		callingName: input.contact.callingName,
		email: input.contact.email,
		gender: input.contact.gender,
		language: input.contact.language,
		dateOfBirth: input.contact.dateOfBirth,
		profession: input.contact.profession,
		phone: buildPhoneUpdateOperation({
			nextPhoneNumber: input.contact.phone,
			nextHasWhatsApp: input.contact.hasWhatsApp,
			currentPhoneId: context.phoneId,
			currentPhoneNumber: context.phoneNumber,
		}),
		address: buildAddressUpdateOperation(address, context.addressId),
	};
};

const buildPhoneUpdateOperation = ({
	nextPhoneNumber,
	nextHasWhatsApp,
	currentPhoneId,
	currentPhoneNumber,
}: {
	nextPhoneNumber: string | undefined;
	nextHasWhatsApp: boolean;
	currentPhoneId: string | undefined;
	currentPhoneNumber: string | undefined;
}): Prisma.PhoneUpdateOneWithoutContactsNestedInput | undefined => {
	if (nextPhoneNumber) {
		if (currentPhoneId && currentPhoneNumber === nextPhoneNumber) {
			return {
				update: {
					where: { id: currentPhoneId },
					data: {
						hasWhatsApp: nextHasWhatsApp,
					},
				},
			};
		}

		if (currentPhoneId) {
			return {
				connectOrCreate: {
					where: { number: nextPhoneNumber },
					create: {
						number: nextPhoneNumber,
						hasWhatsApp: nextHasWhatsApp,
					},
				},
			};
		}

		return {
			create: {
				number: nextPhoneNumber,
				hasWhatsApp: nextHasWhatsApp,
			},
		};
	}

	return currentPhoneId ? { disconnect: true } : undefined;
};

const buildAddressUpdateOperation = (
	address: Prisma.AddressCreateWithoutContactsInput | undefined,
	currentAddressId: string | undefined,
): Prisma.AddressUpdateOneWithoutContactsNestedInput | undefined => {
	if (address) {
		return currentAddressId
			? {
					upsert: {
						where: { id: currentAddressId },
						update: address,
						create: address,
					},
				}
			: { create: address };
	}

	return currentAddressId ? { disconnect: true } : undefined;
};

const buildSelfAddressUpdateOperation = (
	address: UpdateContributorSelfInput['contact']['address'],
	currentAddressId: string | undefined,
): Prisma.AddressUpdateOneWithoutContactsNestedInput | undefined => {
	if (!address) {
		return undefined;
	}

	const create = {
		street: address.street ?? '',
		number: address.number ?? '',
		city: address.city ?? '',
		zip: address.zip ?? '',
		country: address.country,
	};
	const update = {
		...(address.street !== undefined ? { street: address.street } : {}),
		...(address.number !== undefined ? { number: address.number } : {}),
		...(address.city !== undefined ? { city: address.city } : {}),
		...(address.zip !== undefined ? { zip: address.zip } : {}),
		country: address.country,
	};

	return currentAddressId
		? {
				upsert: {
					where: { id: currentAddressId },
					update,
					create,
				},
			}
		: { create };
};

const buildAddressData = (
	contact: CreateContributorInput['contact'],
): Prisma.AddressCreateWithoutContactsInput | undefined => {
	if (![contact.street, contact.number, contact.city, contact.zip, contact.country].some(Boolean)) {
		return undefined;
	}

	return {
		street: contact.street ?? '',
		number: contact.number ?? '',
		city: contact.city ?? '',
		zip: contact.zip ?? '',
		country: contact.country,
	};
};
