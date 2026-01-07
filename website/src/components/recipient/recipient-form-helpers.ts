import { FormField } from '@/components/dynamic-form/dynamic-form';
import { buildAddressInput, buildCommonContactData } from '@/components/dynamic-form/helper';
import { RecipientCreateInput, RecipientPayload, RecipientUpdateInput } from '@/lib/services/recipient/recipient.types';
import { RecipientFormSchema } from './recipient-form';

export function buildUpdateRecipientInput(
	schema: RecipientFormSchema,
	recipient: RecipientPayload,
	contactFields: { [key: string]: FormField },
): RecipientUpdateInput {
	const paymentInfoFields = schema.fields.paymentInformation.fields;
	const basePaymentInfo = {
		provider: paymentInfoFields.provider.value,
		code: paymentInfoFields.code.value,
	};

	const paymentPhoneValue = paymentInfoFields.phone.value ?? null;
	const contactPhoneValue = contactFields.phone.value ?? null;

	const paymentPhoneChanged =
		paymentPhoneValue !== null && paymentPhoneValue !== recipient.paymentInformation?.phone?.number;

	const contactPhoneChanged = contactPhoneValue !== null && contactPhoneValue !== recipient.contact.phone?.number;

	const paymentPhoneUpdate = paymentPhoneChanged
		? {
				upsert: {
					update: { number: paymentPhoneValue },
					create: { number: paymentPhoneValue },
					where: { id: recipient.paymentInformation?.phone?.id },
				},
			}
		: undefined;

	let contactPhoneUpdate = contactPhoneChanged
		? {
				update: {
					data: { number: contactPhoneValue },
					where: { id: recipient.contact.phone?.id },
				},
			}
		: undefined;

	const samePhoneId =
		recipient.paymentInformation?.phone?.id &&
		recipient.contact.phone?.id &&
		recipient.paymentInformation.phone.id === recipient.contact.phone.id;

	if (samePhoneId && paymentPhoneChanged) {
		contactPhoneUpdate = undefined;
	}

	const addressUpdate = buildAddressInput(contactFields);
	return {
		id: recipient.id,
		startDate: schema.fields.startDate.value,
		status: schema.fields.status.value,
		successorName: schema.fields.successorName.value || null,
		termsAccepted: schema.fields.termsAccepted.value ?? false,
		localPartner: { connect: { id: schema.fields.localPartner.value } },
		program: { connect: { id: schema.fields.program.value } },
		paymentInformation: {
			upsert: {
				create: {
					...basePaymentInfo,
					phone: {
						create: {
							number: paymentPhoneValue ?? recipient.paymentInformation?.phone?.number!,
						},
					},
				},
				update: { ...basePaymentInfo, phone: paymentPhoneUpdate },
				where: { id: recipient.paymentInformation?.id },
			},
		},
		contact: {
			update: {
				data: {
					...buildCommonContactData(contactFields),
					phone: contactPhoneUpdate,
					address: {
						upsert: {
							update: addressUpdate,
							create: addressUpdate,
							where: { id: recipient.contact.address?.id },
						},
					},
				},
				where: { id: recipient.contact.id },
			},
		},
	};
}

export function buildCreateRecipientInput(
	schema: RecipientFormSchema,
	contactFields: { [key: string]: FormField },
): RecipientCreateInput {
	const paymentInfoFields = schema.fields.paymentInformation.fields;
	return {
		startDate: schema.fields.startDate.value,
		status: schema.fields.status.value,
		successorName: schema.fields.successorName.value,
		termsAccepted: schema.fields.termsAccepted.value ?? false,
		localPartner: { connect: { id: schema.fields.localPartner.value } },
		program: { connect: { id: schema.fields.program.value } },
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
				address: { create: buildAddressInput(contactFields) },
			},
		},
	};
}
