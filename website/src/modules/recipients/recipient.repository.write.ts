import type { Prisma } from '@/generated/prisma/client';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, type AuditedEntity } from '@/lib/audit/audited-write';
import { recipientWithPaymentInformationSelect } from './recipient.repository.read';
import type { CreateRecipientInput, UpdateRecipientInput, UpdateRecipientSelfInput } from './recipient.schemas';

// Every write here stores a recipient audit event in the same transaction.
// Reads live in recipient.repository.read.ts.

export const createRecipient = async (audit: AuditContext, input: CreateRecipientInput) =>
	auditedWrite({ entity: recipientEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.recipient.create({ data: buildRecipientCreateData(input) }),
	);

export const updateRecipient = async (
	audit: AuditContext,
	input: UpdateRecipientInput,
	context: RecipientUpdatePersistenceContext,
) =>
	auditedWrite({ entity: recipientEntity, context: audit, action: 'update', entityId: input.id }, async (transaction) => {
		const relations = await findRelationIds(transaction, input.id);
		const recipient = await transaction.recipient.update({
			where: { id: input.id },
			data: buildRecipientUpdateData(input, context),
		});
		await deleteOrphanedRelations(transaction, relations);

		return recipient;
	});

export const updateRecipientSelf = async (
	audit: AuditContext,
	recipientId: string,
	input: UpdateRecipientSelfInput,
	currentPaymentCode: string | null,
) =>
	auditedWrite({ entity: recipientEntity, context: audit, action: 'update', entityId: recipientId }, async (transaction) => {
		const relations = await findRelationIds(transaction, recipientId);
		const recipient = await transaction.recipient.update({
			where: { id: recipientId },
			data: buildRecipientSelfUpdateData(input, currentPaymentCode),
			select: recipientWithPaymentInformationSelect,
		});
		await deleteOrphanedRelations(transaction, relations);

		return recipient;
	});

export const removeRecipientFromProgram = async (audit: AuditContext, recipientId: string, expectedProgramId: string) =>
	auditedWrite({ entity: recipientEntity, context: audit, action: 'update', entityId: recipientId }, (transaction) =>
		transaction.recipient.updateMany({
			where: {
				id: recipientId,
				programId: expectedProgramId,
				payouts: { none: {} },
			},
			data: {
				programId: null,
				startDate: null,
			},
		}),
	);

export const removeRecipientsFromProgram = async (audit: AuditContext, recipientIds: string[], programId: string) =>
	auditedWrite({ entity: recipientEntity, context: audit, action: 'update', entityId: recipientIds }, (transaction) =>
		transaction.recipient.updateMany({
			where: { id: { in: recipientIds }, programId },
			data: { programId: null },
		}),
	);

export const deleteRecipient = async (audit: AuditContext, recipientId: string) =>
	auditedWrite({ entity: recipientEntity, context: audit, action: 'delete', entityId: recipientId }, async (transaction) => {
		const relations = await findRelationIds(transaction, recipientId);
		await transaction.recipient.delete({ where: { id: recipientId } });
		if (relations.paymentInformationId) {
			await transaction.paymentInformation.delete({ where: { id: relations.paymentInformationId } });
		}
		await transaction.contact.delete({ where: { id: relations.contactId } });
		await deleteOrphanedRelations(transaction, relations);

		return { id: recipientId };
	});

// The audit snapshot of a recipient includes its contact, phones, address
// and payment information, so a payment phone change shows up as
// `paymentInformation.phone.number`.
const recipientAuditSnapshotSelect = {
	programId: true,
	localPartnerId: true,
	startDate: true,
	suspendedAt: true,
	suspensionReason: true,
	successorName: true,
	termsAccepted: true,
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
			phone: { select: { number: true, hasWhatsApp: true } },
			address: { select: { street: true, number: true, city: true, zip: true, country: true } },
		},
	},
	paymentInformation: {
		select: {
			code: true,
			mobileMoneyProviderId: true,
			phone: { select: { number: true } },
		},
	},
} satisfies Prisma.RecipientSelect;

const recipientEntity: AuditedEntity = {
	type: 'recipient',
	findSnapshot: (transaction, recipientId) =>
		transaction.recipient.findUnique({ where: { id: recipientId }, select: recipientAuditSnapshotSelect }),
};

const findRelationIds = async (transaction: Prisma.TransactionClient, recipientId: string) => {
	const recipient = await transaction.recipient.findUniqueOrThrow({
		where: { id: recipientId },
		select: {
			contactId: true,
			paymentInformationId: true,
			contact: { select: { phoneId: true, addressId: true } },
			paymentInformation: { select: { phoneId: true } },
		},
	});

	return {
		contactId: recipient.contactId,
		paymentInformationId: recipient.paymentInformationId,
		phoneIds: [recipient.contact.phoneId, recipient.paymentInformation?.phoneId].filter(
			(id) => id !== null && id !== undefined,
		),
		addressId: recipient.contact.addressId,
	};
};

// Phones and addresses can be shared, so only rows nothing references
// anymore are deleted.
const deleteOrphanedRelations = async (
	transaction: Prisma.TransactionClient,
	{ phoneIds, addressId }: { phoneIds: string[]; addressId: string | null },
) => {
	await transaction.phone.deleteMany({
		where: { id: { in: phoneIds }, contacts: { none: {} }, paymentInformations: { none: {} } },
	});
	if (addressId) {
		await transaction.address.deleteMany({ where: { id: addressId, contacts: { none: {} } } });
	}
};

type RecipientUpdatePersistenceContext = {
	contactId: string;
	contactPhoneId: string | undefined;
	contactPhoneNumber: string | undefined;
	contactAddressId: string | undefined;
	paymentInformationId: string | undefined;
	paymentPhoneId: string | undefined;
	paymentPhoneNumber: string | undefined;
};

const buildRecipientCreateData = (input: CreateRecipientInput): Prisma.RecipientCreateInput => {
	if (!input.programId || !input.localPartnerId) {
		throw new Error('Recipient persistence requires a program and local partner');
	}

	return {
		startDate: input.startDate ?? null,
		suspendedAt: input.suspendedAt ?? null,
		suspensionReason: input.suspensionReason ?? null,
		successorName: input.successorName ?? null,
		termsAccepted: input.termsAccepted ?? false,
		program: { connect: { id: input.programId } },
		localPartner: { connect: { id: input.localPartnerId } },
		contact: { create: buildContactCreateData(input) },
		paymentInformation: buildPaymentInformationCreateData(input),
	};
};

const buildContactCreateData = (input: CreateRecipientInput): Prisma.ContactCreateWithoutRecipientInput => ({
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
	address: buildAddressCreateOperation(input),
});

const buildPaymentInformationCreateData = (
	input: CreateRecipientInput,
): Prisma.PaymentInformationCreateNestedOneWithoutRecipientsInput | undefined => {
	const { mobileMoneyProviderId, code, phone } = input.paymentInformation;
	if (!mobileMoneyProviderId && !code && !phone) {
		return undefined;
	}

	return {
		create: {
			mobileMoneyProvider: mobileMoneyProviderId ? { connect: { id: mobileMoneyProviderId } } : undefined,
			code: code ?? null,
			phone: phone ? { create: { number: phone } } : undefined,
		},
	};
};

const buildRecipientUpdateData = (
	input: UpdateRecipientInput,
	context: RecipientUpdatePersistenceContext,
): Prisma.RecipientUpdateInput => {
	const paymentInformation = buildPaymentInformationUpdateOperation(input, context);

	return {
		startDate: input.startDate ?? null,
		suspendedAt: input.suspendedAt ?? null,
		suspensionReason: input.suspensionReason ?? null,
		successorName: input.successorName ?? null,
		termsAccepted: input.termsAccepted ?? false,
		program: input.programId ? { connect: { id: input.programId } } : undefined,
		localPartner: input.localPartnerId ? { connect: { id: input.localPartnerId } } : undefined,
		contact: {
			update: {
				where: { id: context.contactId },
				data: {
					firstName: input.contact.firstName,
					lastName: input.contact.lastName,
					callingName: input.contact.callingName,
					email: input.contact.email,
					gender: input.contact.gender,
					language: input.contact.language,
					dateOfBirth: input.contact.dateOfBirth,
					profession: input.contact.profession,
					phone: buildContactPhoneUpdateOperation(input, context),
					address: buildAddressUpdateOperation(input, context.contactAddressId),
				},
			},
		},
		paymentInformation,
	};
};

const buildContactPhoneUpdateOperation = (
	input: UpdateRecipientInput,
	context: RecipientUpdatePersistenceContext,
): Prisma.PhoneUpdateOneWithoutContactsNestedInput | undefined => {
	const nextPhoneNumber = input.contact.phone;
	if (nextPhoneNumber) {
		if (context.contactPhoneId && context.contactPhoneNumber === nextPhoneNumber) {
			return {
				update: {
					where: { id: context.contactPhoneId },
					data: { hasWhatsApp: input.contact.hasWhatsApp },
				},
			};
		}

		if (context.contactPhoneId) {
			return {
				connectOrCreate: {
					where: { number: nextPhoneNumber },
					create: {
						number: nextPhoneNumber,
						hasWhatsApp: input.contact.hasWhatsApp,
					},
				},
			};
		}

		return {
			create: {
				number: nextPhoneNumber,
				hasWhatsApp: input.contact.hasWhatsApp,
			},
		};
	}

	return context.contactPhoneId ? { disconnect: true } : undefined;
};

const buildPaymentInformationUpdateOperation = (
	input: UpdateRecipientInput,
	context: RecipientUpdatePersistenceContext,
): Prisma.PaymentInformationUpdateOneWithoutRecipientsNestedInput | undefined => {
	const { mobileMoneyProviderId, code, phone } = input.paymentInformation;
	const hasPaymentPayload = Boolean(mobileMoneyProviderId ?? code ?? phone);
	const create = {
		mobileMoneyProvider: mobileMoneyProviderId ? { connect: { id: mobileMoneyProviderId } } : undefined,
		code: code ?? null,
		phone: phone ? { create: { number: phone } } : undefined,
	};

	if (!context.paymentInformationId) {
		return hasPaymentPayload ? { create } : undefined;
	}

	return {
		upsert: {
			where: { id: context.paymentInformationId },
			create,
			update: {
				mobileMoneyProvider: mobileMoneyProviderId ? { connect: { id: mobileMoneyProviderId } } : { disconnect: true },
				code: code ?? null,
				phone: buildPaymentPhoneUpdateOperation(phone, context),
			},
		},
	};
};

const buildPaymentPhoneUpdateOperation = (
	nextPhoneNumber: string | undefined,
	context: RecipientUpdatePersistenceContext,
): Prisma.PhoneUpdateOneWithoutPaymentInformationsNestedInput | undefined => {
	if (nextPhoneNumber) {
		if (context.paymentPhoneId && context.paymentPhoneNumber === nextPhoneNumber) {
			return undefined;
		}

		if (context.paymentPhoneId) {
			return {
				connectOrCreate: {
					where: { number: nextPhoneNumber },
					create: { number: nextPhoneNumber },
				},
			};
		}

		return { create: { number: nextPhoneNumber } };
	}

	return context.paymentPhoneId ? { disconnect: true } : undefined;
};

const buildAddressCreateOperation = (
	input: CreateRecipientInput,
): Prisma.AddressCreateNestedOneWithoutContactsInput | undefined => {
	const address = buildAddressData(input.contact);

	return address ? { create: address } : undefined;
};

const buildAddressUpdateOperation = (
	input: UpdateRecipientInput,
	currentAddressId: string | undefined,
): Prisma.AddressUpdateOneWithoutContactsNestedInput | undefined => {
	const address = buildAddressData(input.contact);
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

const buildAddressData = (contact: CreateRecipientInput['contact']) => {
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

const buildRecipientSelfUpdateData = (
	input: UpdateRecipientSelfInput,
	currentPaymentCode: string | null,
): Prisma.RecipientUpdateInput => ({
	contact: {
		update: {
			firstName: input.firstName,
			lastName: input.lastName,
			callingName: input.callingName,
			gender: input.gender,
			dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
			language: input.language,
			email: input.email,
			phone:
				input.contactPhone === null
					? { disconnect: true }
					: input.contactPhone
						? {
								connectOrCreate: {
									where: { number: input.contactPhone },
									create: { number: input.contactPhone },
								},
							}
						: undefined,
		},
	},
	successorName: input.successorName,
	termsAccepted: input.termsAccepted,
	paymentInformation:
		input.paymentPhone || input.paymentProvider
			? {
					upsert: {
						update: {
							mobileMoneyProvider: input.paymentProvider ? { connect: { id: input.paymentProvider } } : { disconnect: true },
							phone: input.paymentPhone
								? {
										connectOrCreate: {
											where: { number: input.paymentPhone },
											create: { number: input.paymentPhone },
										},
									}
								: undefined,
						},
						create: {
							mobileMoneyProvider: input.paymentProvider ? { connect: { id: input.paymentProvider } } : undefined,
							code: currentPaymentCode ?? '',
							phone: input.paymentPhone
								? {
										connectOrCreate: {
											where: { number: input.paymentPhone },
											create: { number: input.paymentPhone },
										},
									}
								: undefined,
						},
					},
				}
			: undefined,
});
