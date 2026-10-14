import type { Prisma } from '@/generated/prisma/client';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, defineAuditedEntity } from '@/lib/audit/audited-write';
import { localPartnerPayloadSelect } from './local-partner.repository.read';
import type { LocalPartnerCreateInput, LocalPartnerUpdateInput } from './local-partner.schemas';

// Every write here stores a local partner audit event in the same
// transaction. Reads live in local-partner.repository.read.ts.

export const createLocalPartner = async (audit: AuditContext, input: LocalPartnerCreateInput, firebaseAuthUserId: string) =>
	auditedWrite({ entity: localPartnerEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.localPartner.create({
			data: {
				name: input.name,
				slug: input.slug,
				focuses: { create: input.focuses.map((focusId) => ({ focusId })) },
				account: { create: { firebaseAuthUserId } },
				contact: { create: buildContactCreateData(input) },
			},
			select: localPartnerPayloadSelect,
		}),
	);

export const updateLocalPartner = async (
	audit: AuditContext,
	localPartnerId: string,
	input: LocalPartnerUpdateInput,
	context: {
		contactId: string;
		phoneId: string | undefined;
		phoneNumber: string | undefined;
		addressId: string | undefined;
	},
) =>
	auditedWrite(
		{ entity: localPartnerEntity, context: audit, action: 'update', entityId: localPartnerId },
		async (transaction) => {
			const relations = await findRelationIds(transaction, localPartnerId);
			const localPartner = await transaction.localPartner.update({
				where: { id: localPartnerId },
				data: {
					name: input.name,
					slug: input.slug,
					focuses: {
						deleteMany: {},
						create: input.focuses.map((focusId) => ({ focusId })),
					},
					contact: {
						update: {
							where: { id: context.contactId },
							data: buildContactUpdateData(input, context),
						},
					},
				},
				select: localPartnerPayloadSelect,
			});
			await deleteOrphanedRelations(transaction, relations);

			return localPartner;
		},
	);

export const deleteLocalPartner = async (audit: AuditContext, localPartnerId: string) =>
	auditedWrite(
		{ entity: localPartnerEntity, context: audit, action: 'delete', entityId: localPartnerId },
		async (transaction) => {
			const relations = await findRelationIds(transaction, localPartnerId);
			await transaction.localPartner.delete({ where: { id: localPartnerId } });
			await transaction.contact.delete({ where: { id: relations.contactId } });
			await transaction.account.delete({ where: { id: relations.accountId } });
			await deleteOrphanedRelations(transaction, relations);
		},
	);

// The contact with its phone and address, the account and the focus links
// belong to the local partner's snapshot.
const localPartnerAuditSnapshotSelect = {
	legacyFirestoreId: true,
	name: true,
	slug: true,
	account: { select: { firebaseAuthUserId: true } },
	focuses: { select: { focusId: true }, orderBy: { focusId: 'asc' } },
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
} satisfies Prisma.LocalPartnerSelect;

export const localPartnerEntity = defineAuditedEntity({
	type: 'local-partner',
	findSnapshot: (transaction, localPartnerId) =>
		transaction.localPartner.findUnique({ where: { id: localPartnerId }, select: localPartnerAuditSnapshotSelect }),
	getName: ({ name }) => name,
});

const findRelationIds = async (transaction: Prisma.TransactionClient, localPartnerId: string) => {
	const localPartner = await transaction.localPartner.findUniqueOrThrow({
		where: { id: localPartnerId },
		select: { contactId: true, accountId: true, contact: { select: { phoneId: true, addressId: true } } },
	});

	return {
		contactId: localPartner.contactId,
		accountId: localPartner.accountId,
		phoneId: localPartner.contact.phoneId,
		addressId: localPartner.contact.addressId,
	};
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

const buildContactCreateData = (input: LocalPartnerCreateInput): Prisma.ContactCreateWithoutLocalPartnerInput => ({
	firstName: input.contact.firstName,
	lastName: input.contact.lastName,
	callingName: input.contact.callingName,
	email: input.contact.email,
	gender: input.contact.gender,
	language: input.contact.language,
	dateOfBirth: input.contact.dateOfBirth,
	profession: input.contact.profession,
	phone: input.contact.phone
		? { create: { number: input.contact.phone, hasWhatsApp: input.contact.hasWhatsApp } }
		: undefined,
	address: getAddressInput(input) ? { create: getAddressInput(input) } : undefined,
});

const buildContactUpdateData = (
	input: LocalPartnerUpdateInput,
	context: {
		phoneId: string | undefined;
		phoneNumber: string | undefined;
		addressId: string | undefined;
	},
): Prisma.ContactUpdateWithoutLocalPartnerInput => {
	const addressInput = getAddressInput(input);

	return {
		firstName: input.contact.firstName,
		lastName: input.contact.lastName,
		callingName: input.contact.callingName,
		email: input.contact.email,
		gender: input.contact.gender,
		language: input.contact.language,
		dateOfBirth: input.contact.dateOfBirth,
		profession: input.contact.profession,
		phone: buildPhoneWriteOperation(input, context.phoneId, context.phoneNumber),
		address: buildAddressWriteOperation(addressInput, context.addressId),
	};
};

const buildPhoneWriteOperation = (
	input: LocalPartnerUpdateInput,
	currentPhoneId: string | undefined,
	currentPhoneNumber: string | undefined,
): Prisma.PhoneUpdateOneWithoutContactsNestedInput | undefined => {
	if (input.contact.phone) {
		if (currentPhoneId && currentPhoneNumber === input.contact.phone) {
			return {
				update: {
					where: { id: currentPhoneId },
					data: { hasWhatsApp: input.contact.hasWhatsApp },
				},
			};
		}
		if (currentPhoneId) {
			return {
				connectOrCreate: {
					where: { number: input.contact.phone },
					create: { number: input.contact.phone, hasWhatsApp: input.contact.hasWhatsApp },
				},
			};
		}

		return { create: { number: input.contact.phone, hasWhatsApp: input.contact.hasWhatsApp } };
	}

	return currentPhoneId ? { disconnect: true } : undefined;
};

const buildAddressWriteOperation = (
	addressInput: Prisma.AddressCreateWithoutContactsInput | undefined,
	currentAddressId: string | undefined,
): Prisma.AddressUpdateOneWithoutContactsNestedInput | undefined => {
	if (addressInput) {
		return currentAddressId
			? {
					upsert: {
						where: { id: currentAddressId },
						update: addressInput,
						create: addressInput,
					},
				}
			: { create: addressInput };
	}

	return currentAddressId ? { disconnect: true } : undefined;
};

const getAddressInput = (
	input: LocalPartnerCreateInput | LocalPartnerUpdateInput,
): Prisma.AddressCreateWithoutContactsInput | undefined => {
	const { contact } = input;
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
