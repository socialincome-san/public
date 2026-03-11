/**
 * PHONE UPDATE CASES
 *
 * Contact.phone and PaymentInformation.phone may reference:
 *   - the same Phone record (shared), or
 *   - two different Phone records (independent).
 *
 * On update:
 *   1. If independent → update each normally.
 *   2. If shared + only one changed → split (create new phone for changed side).
 *   3. If shared + both changed → split both.
 *   4. If independent + both become same → converge (connect both to same record).
 */

import { FormField } from '@/components/dynamic-form/dynamic-form';
import { buildAddressInput, buildCommonContactData } from '@/components/dynamic-form/helper';
import { Prisma } from '@/generated/prisma/client';
import { RecipientCreateInput, RecipientPayload, RecipientUpdateInput } from '@/lib/services/recipient/recipient.types';
import { RecipientFormSchema } from './recipient-form';

const toTrimmedStringOrNull = (value: unknown): string | null => {
	return typeof value === 'string' && value.trim() ? value.trim() : null;
};

export const buildUpdateRecipientInput = (
	schema: RecipientFormSchema,
	recipient: RecipientPayload,
	contactFields: Record<string, FormField>,
): RecipientUpdateInput => {
	const paymentInfoFields = schema.fields.paymentInformation.fields;

	const mobileMoneyProviderId = paymentInfoFields.provider.value as string | undefined;
	const basePaymentInformation = {
		code: toTrimmedStringOrNull(paymentInfoFields.code.value),
		mobileMoneyProvider: mobileMoneyProviderId ? { connect: { id: mobileMoneyProviderId } } : { disconnect: true },
	};

	const nextPaymentPhoneNumber = toTrimmedStringOrNull(paymentInfoFields.phone.value);
	const nextContactPhoneNumber = toTrimmedStringOrNull(contactFields.phone.value);

	const previousPaymentPhone = recipient.paymentInformation?.phone;
	const previousContactPhone = recipient.contact.phone;

	const previousPaymentPhoneNumber = previousPaymentPhone?.number ?? null;
	const previousContactPhoneNumber = previousContactPhone?.number ?? null;

	const paymentPhoneHasChanged = (nextPaymentPhoneNumber ?? '') !== (previousPaymentPhoneNumber ?? '');
	const contactPhoneHasChanged = (nextContactPhoneNumber ?? '') !== (previousContactPhoneNumber ?? '');

	const previouslySharedPhoneRecord =
		previousPaymentPhone?.id && previousContactPhone?.id && previousPaymentPhone.id === previousContactPhone.id;

	let paymentPhoneWriteOperation: Prisma.PhoneUpdateOneWithoutPaymentInformationsNestedInput | undefined = undefined;

	let contactPhoneWriteOperation: Prisma.PhoneUpdateOneWithoutContactsNestedInput | undefined = undefined;

	const willConvergeToSamePhone =
		nextPaymentPhoneNumber &&
		nextContactPhoneNumber &&
		nextPaymentPhoneNumber === nextContactPhoneNumber &&
		!previouslySharedPhoneRecord;

	if (willConvergeToSamePhone) {
		paymentPhoneWriteOperation = {
			upsert: {
				update: { number: nextPaymentPhoneNumber },
				create: { number: nextPaymentPhoneNumber },
				where: { id: previousPaymentPhone?.id },
			},
		};

		contactPhoneWriteOperation = {
			connectOrCreate: {
				where: { number: nextContactPhoneNumber },
				create: { number: nextContactPhoneNumber },
			},
		};
	} else if (!previouslySharedPhoneRecord) {
		if (paymentPhoneHasChanged) {
			paymentPhoneWriteOperation = {
				upsert: {
					update: { number: nextPaymentPhoneNumber! },
					create: { number: nextPaymentPhoneNumber! },
					where: { id: previousPaymentPhone?.id },
				},
			};
		}

		if (contactPhoneHasChanged) {
			contactPhoneWriteOperation = {
				upsert: {
					update: { number: nextContactPhoneNumber! },
					create: { number: nextContactPhoneNumber! },
					where: { id: previousContactPhone?.id },
				},
			};
		}
	} else {
		if (paymentPhoneHasChanged && !contactPhoneHasChanged) {
			paymentPhoneWriteOperation = {
				connectOrCreate: {
					where: { number: nextPaymentPhoneNumber! },
					create: { number: nextPaymentPhoneNumber! },
				},
			};
		}

		if (!paymentPhoneHasChanged && contactPhoneHasChanged) {
			contactPhoneWriteOperation = {
				connectOrCreate: {
					where: { number: nextContactPhoneNumber! },
					create: { number: nextContactPhoneNumber! },
				},
			};
		}

		if (paymentPhoneHasChanged && contactPhoneHasChanged) {
			paymentPhoneWriteOperation = {
				connectOrCreate: {
					where: { number: nextPaymentPhoneNumber! },
					create: { number: nextPaymentPhoneNumber! },
				},
			};
			contactPhoneWriteOperation = {
				connectOrCreate: {
					where: { number: nextContactPhoneNumber! },
					create: { number: nextContactPhoneNumber! },
				},
			};
		}
	}

	if (contactPhoneHasChanged && !nextContactPhoneNumber) {
		contactPhoneWriteOperation = { disconnect: true };
	}

	if (paymentPhoneHasChanged && !nextPaymentPhoneNumber) {
		paymentPhoneWriteOperation = { disconnect: true };
	}

	const addressUpdateOperation = buildAddressInput(contactFields);

	return {
		id: recipient.id,
		startDate: schema.fields.startDate.value,
		suspendedAt: schema.fields.suspendedAt.value,
		suspensionReason: schema.fields.suspensionReason.value,
		successorName: schema.fields.successorName.value || null,
		termsAccepted: schema.fields.termsAccepted.value ?? false,
		localPartner: { connect: { id: schema.fields.localPartner?.value } },
		program: { connect: { id: schema.fields.program?.value } },

		paymentInformation: {
			upsert: {
				create: {
					...basePaymentInformation,
					...((nextPaymentPhoneNumber ?? previousPaymentPhoneNumber) && {
						phone: {
							create: {
								number: nextPaymentPhoneNumber ?? previousPaymentPhoneNumber!,
							},
						},
					}),
				},
				update: {
					...basePaymentInformation,
					phone: paymentPhoneWriteOperation,
				},
				where: { id: recipient.paymentInformation?.id },
			},
		},

		contact: {
			update: {
				data: {
					...buildCommonContactData(contactFields),
					phone: contactPhoneWriteOperation,
					...(addressUpdateOperation && {
						address: {
							upsert: {
								update: addressUpdateOperation,
								create: addressUpdateOperation,
								where: { id: recipient.contact.address?.id },
							},
						},
					}),
				},
				where: { id: recipient.contact.id },
			},
		},
	};
};

export const buildCreateRecipientInput = (
	schema: RecipientFormSchema,
	contactFields: Record<string, FormField>,
): RecipientCreateInput => {
	const paymentInfoFields = schema.fields.paymentInformation.fields;

	return {
		startDate: schema.fields.startDate.value,
		suspendedAt: schema.fields.suspendedAt.value,
		suspensionReason: schema.fields.suspensionReason.value,
		successorName: schema.fields.successorName.value,
		termsAccepted: schema.fields.termsAccepted.value ?? false,
		localPartner: { connect: { id: schema.fields.localPartner?.value } },
		program: { connect: { id: schema.fields.program?.value } },
		paymentInformation: {
			create: {
				...(paymentInfoFields.provider.value && {
					mobileMoneyProvider: { connect: { id: paymentInfoFields.provider.value as string } },
				}),
				code: toTrimmedStringOrNull(paymentInfoFields.code.value),
				...(toTrimmedStringOrNull(paymentInfoFields.phone.value) && {
					phone: { create: { number: toTrimmedStringOrNull(paymentInfoFields.phone.value)! } },
				}),
			},
		},
		contact: {
			create: {
				...buildCommonContactData(contactFields),
				phone: contactFields.phone.value ? { create: { number: contactFields.phone.value } } : undefined,
				address: { create: buildAddressInput(contactFields) },
			},
		},
	};
};
