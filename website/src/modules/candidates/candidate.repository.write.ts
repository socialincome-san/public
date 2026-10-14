import type { Prisma } from '@/generated/prisma/client';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, type AuditedEntity } from '@/lib/audit/audited-write';
import { candidatePayloadSelect } from './candidate.repository.read';
import type { CandidateCreateInput, CandidateUpdateInput } from './candidate.schemas';

// Candidates are recipients without a program, so every write here stores a
// recipient audit event in the same transaction. Reads live in
// candidate.repository.read.ts.

export const createCandidate = async (audit: AuditContext, input: CandidateCreateInput, localPartnerId: string) =>
	auditedWrite({ entity: recipientEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.recipient.create({
			data: buildCandidateCreateData(input, localPartnerId),
			select: candidatePayloadSelect,
		}),
	);

export const updateCandidate = async (
	audit: AuditContext,
	input: CandidateUpdateInput,
	context: CandidateUpdatePersistenceContext,
) =>
	auditedWrite({ entity: recipientEntity, context: audit, action: 'update', entityId: input.id }, async (transaction) => {
		const relations = await findRelationIds(transaction, input.id);
		const candidate = await transaction.recipient.update({
			where: { id: input.id },
			data: buildCandidateUpdateData(input, context),
			select: candidatePayloadSelect,
		});
		await deleteOrphanedRelations(transaction, relations);

		return candidate;
	});

export const deleteCandidate = async (audit: AuditContext, candidateId: string) =>
	auditedWrite({ entity: recipientEntity, context: audit, action: 'delete', entityId: candidateId }, async (transaction) => {
		const relations = await findRelationIds(transaction, candidateId);
		await transaction.recipient.delete({ where: { id: candidateId } });
		if (relations.paymentInformationId) {
			await transaction.paymentInformation.delete({ where: { id: relations.paymentInformationId } });
		}
		await transaction.contact.delete({ where: { id: relations.contactId } });
		await deleteOrphanedRelations(transaction, relations);
	});

/** Assigns `amount` random candidates of `candidateIds` that are still unassigned, or none. */
export const updateUnassignedCandidateAssignments = async (
	audit: AuditContext,
	candidateIds: string[],
	programId: string,
	amount: number,
): Promise<{ outcome: 'assigned'; assigned: number } | { outcome: 'insufficient' }> => {
	if (candidateIds.length < amount) {
		return { outcome: 'insufficient' };
	}

	try {
		const assigned = await auditedWrite(
			{ entity: recipientEntity, context: audit, action: 'update' },
			async (transaction) => {
				// SKIP LOCKED lets concurrent assignments pick disjoint candidates instead of colliding on the same rows.
				const rows = await transaction.$queryRaw<{ id: string }[]>`
				UPDATE recipient SET program_id = ${programId}, updated_at = now()
				WHERE id IN (
					SELECT id FROM recipient
					WHERE id = ANY(${candidateIds}) AND program_id IS NULL
					ORDER BY random()
					LIMIT ${amount}
					FOR UPDATE SKIP LOCKED
				)
				RETURNING id`;
				if (rows.length !== amount) {
					throw new Error(INSUFFICIENT_CANDIDATES);
				}

				return rows;
			},
		);

		return { outcome: 'assigned', assigned: assigned.length };
	} catch (error) {
		if (error instanceof Error && error.message === INSUFFICIENT_CANDIDATES) {
			return { outcome: 'insufficient' };
		}

		throw error;
	}
};

const INSUFFICIENT_CANDIDATES = 'INSUFFICIENT_CANDIDATES';

// Must match recipientAuditSnapshotSelect in recipient.repository.write.ts:
// both write the history of the same recipient rows, and any difference
// would show up as a change.
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

const findRelationIds = async (transaction: Prisma.TransactionClient, candidateId: string) => {
	const candidate = await transaction.recipient.findUniqueOrThrow({
		where: { id: candidateId },
		select: {
			contactId: true,
			paymentInformationId: true,
			contact: { select: { phoneId: true, addressId: true } },
			paymentInformation: { select: { phoneId: true } },
		},
	});

	return {
		contactId: candidate.contactId,
		paymentInformationId: candidate.paymentInformationId,
		phoneIds: [candidate.contact.phoneId, candidate.paymentInformation?.phoneId].filter(
			(id) => id !== null && id !== undefined,
		),
		addressId: candidate.contact.addressId,
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

type CandidateUpdatePersistenceContext = {
	contactId: string;
	contactPhoneId: string | undefined;
	contactPhoneNumber: string | undefined;
	contactAddressId: string | undefined;
	paymentInformationId: string | undefined;
	paymentPhoneId: string | undefined;
	paymentPhoneNumber: string | undefined;
};

const buildCandidateCreateData = (input: CandidateCreateInput, localPartnerId: string): Prisma.RecipientCreateInput => {
	const paymentInformation = buildPaymentInformationCreateData(input);

	return {
		startDate: null,
		suspendedAt: input.suspendedAt ?? null,
		suspensionReason: input.suspensionReason ?? null,
		successorName: input.successorName ?? null,
		termsAccepted: input.termsAccepted ?? false,
		localPartner: { connect: { id: localPartnerId } },
		contact: { create: buildContactCreateData(input) },
		paymentInformation: paymentInformation ? { create: paymentInformation } : undefined,
	};
};

const buildPaymentInformationCreateData = (
	input: CandidateCreateInput,
): Prisma.PaymentInformationCreateWithoutRecipientsInput | undefined => {
	const { mobileMoneyProviderId, code, phone } = input.paymentInformation;
	if (!mobileMoneyProviderId && !code && !phone) {
		return undefined;
	}

	return {
		mobileMoneyProvider: mobileMoneyProviderId ? { connect: { id: mobileMoneyProviderId } } : undefined,
		code: code ?? null,
		phone: phone ? { create: { number: phone } } : undefined,
	};
};

const buildContactCreateData = (input: CandidateCreateInput): Prisma.ContactCreateWithoutRecipientInput => ({
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

const buildCandidateUpdateData = (
	input: CandidateUpdateInput,
	context: CandidateUpdatePersistenceContext,
): Prisma.RecipientUpdateInput => {
	const addressInput = getAddressInput(input);
	const paymentPhone = buildPaymentPhoneWriteOperation(
		input.paymentInformation.phone,
		context.paymentPhoneId,
		context.paymentPhoneNumber,
	);
	const hasPaymentPayload = Boolean(
		input.paymentInformation.mobileMoneyProviderId ?? input.paymentInformation.code ?? input.paymentInformation.phone,
	);
	const paymentInformation: Prisma.PaymentInformationUpdateOneWithoutRecipientsNestedInput | undefined =
		context.paymentInformationId
			? {
					upsert: {
						where: { id: context.paymentInformationId },
						create: buildPaymentInformationCreateData(input) ?? {},
						update: {
							mobileMoneyProvider: input.paymentInformation.mobileMoneyProviderId
								? { connect: { id: input.paymentInformation.mobileMoneyProviderId } }
								: { disconnect: true },
							code: input.paymentInformation.code ?? null,
							phone: paymentPhone,
						},
					},
				}
			: hasPaymentPayload
				? { create: buildPaymentInformationCreateData(input) ?? {} }
				: undefined;

	return {
		suspendedAt: input.suspendedAt ?? null,
		suspensionReason: input.suspensionReason ?? null,
		successorName: input.successorName ?? null,
		termsAccepted: input.termsAccepted ?? false,
		...(input.localPartnerId ? { localPartner: { connect: { id: input.localPartnerId } } } : {}),
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
					phone: buildContactPhoneWriteOperation(input, context.contactPhoneId, context.contactPhoneNumber),
					address: buildAddressWriteOperation(addressInput, context.contactAddressId),
				},
			},
		},
		...(paymentInformation ? { paymentInformation } : {}),
	};
};

const buildContactPhoneWriteOperation = (
	input: CandidateUpdateInput,
	currentPhoneId: string | undefined,
	currentPhoneNumber: string | undefined,
): Prisma.PhoneUpdateOneWithoutContactsNestedInput | undefined => {
	const nextPhone = input.contact.phone;
	if (nextPhone) {
		if (currentPhoneId && currentPhoneNumber === nextPhone) {
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
					where: { number: nextPhone },
					create: { number: nextPhone, hasWhatsApp: input.contact.hasWhatsApp },
				},
			};
		}

		return { create: { number: nextPhone, hasWhatsApp: input.contact.hasWhatsApp } };
	}

	return currentPhoneId ? { disconnect: true } : undefined;
};

const buildPaymentPhoneWriteOperation = (
	nextPhone: string | undefined,
	currentPhoneId: string | undefined,
	currentPhoneNumber: string | undefined,
): Prisma.PhoneUpdateOneWithoutPaymentInformationsNestedInput | undefined => {
	if (nextPhone) {
		if (currentPhoneId && currentPhoneNumber === nextPhone) {
			return undefined;
		}
		if (currentPhoneId) {
			return {
				connectOrCreate: {
					where: { number: nextPhone },
					create: { number: nextPhone },
				},
			};
		}

		return { create: { number: nextPhone } };
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
	input: CandidateCreateInput | CandidateUpdateInput,
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
