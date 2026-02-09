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
import { CandidateCreateInput, CandidatePayload, CandidateUpdateInput } from '@/lib/services/candidate/candidate.types';
import { CandidateFormSchema } from './candidates-form';

export function buildUpdateCandidateInput(
	schema: CandidateFormSchema,
	candidate: CandidatePayload,
	contactFields: { [key: string]: FormField },
): CandidateUpdateInput {
	const paymentInfoFields = schema.fields.paymentInformation.fields;

	const basePaymentInformation = {
		provider: paymentInfoFields.provider.value,
		code: paymentInfoFields.code.value,
	};

	const nextPaymentPhoneNumber = paymentInfoFields.phone.value ?? null;
	const nextContactPhoneNumber = contactFields.phone.value ?? null;

	const previousPaymentPhone = candidate.paymentInformation?.phone;
	const previousContactPhone = candidate.contact.phone;

	const previousPaymentPhoneNumber = previousPaymentPhone?.number ?? null;
	const previousContactPhoneNumber = previousContactPhone?.number ?? null;

	const paymentPhoneHasChanged = !!(nextPaymentPhoneNumber && nextPaymentPhoneNumber !== previousPaymentPhoneNumber);
	const contactPhoneHasChanged = !!(nextContactPhoneNumber && nextContactPhoneNumber !== previousContactPhoneNumber);

	const previouslySharedPhoneRecord =
		previousPaymentPhone?.id && previousContactPhone?.id && previousPaymentPhone.id === previousContactPhone.id;

	let paymentPhoneWriteOperation: Prisma.PhoneUpdateOneRequiredWithoutPaymentInformationsNestedInput | undefined =
		undefined;
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

	const addressUpdateOperation = buildAddressInput(contactFields);

	return {
		id: candidate.id,
		status: schema.fields.status.value,
		successorName: schema.fields.successorName.value || null,
		termsAccepted: schema.fields.termsAccepted.value ?? false,
		localPartner: { connect: { id: schema.fields.localPartner?.value } },
		paymentInformation: {
			upsert: {
				create: {
					...basePaymentInformation,
					phone: {
						create: {
							number: nextPaymentPhoneNumber ?? previousPaymentPhoneNumber!,
						},
					},
				},
				update: {
					...basePaymentInformation,
					phone: paymentPhoneWriteOperation,
				},
				where: { id: candidate.paymentInformation?.id },
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
								where: { id: candidate.contact.address?.id },
							},
						},
					}),
				},
				where: { id: candidate.contact.id },
			},
		},
	};
}

export function buildCreateCandidateInput(
	schema: CandidateFormSchema,
	contactFields: { [key: string]: FormField },
): CandidateCreateInput {
	const paymentInfoFields = schema.fields.paymentInformation.fields;
	const addressInput = buildAddressInput(contactFields);

	return {
		status: schema.fields.status.value,
		successorName: schema.fields.successorName.value,
		termsAccepted: schema.fields.termsAccepted.value ?? false,
		localPartner: { connect: { id: schema.fields.localPartner?.value } },
		paymentInformation: {
			create: {
				provider: paymentInfoFields.provider.value,
				code: paymentInfoFields.code.value,
				phone: { create: { number: paymentInfoFields.phone.value } },
			},
		},
		contact: {
			create: {
				...buildCommonContactData(contactFields),
				phone: contactFields.phone.value ? { create: { number: contactFields.phone.value } } : undefined,
				...(addressInput && {
					address: { create: addressInput },
				}),
			},
		},
	};
}
