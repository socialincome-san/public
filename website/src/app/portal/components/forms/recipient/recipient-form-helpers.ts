import { FormField } from '@/components/dynamic-form/dynamic-form';
import {
	RecipientCreateInput,
	RecipientPayload,
	RecipientUpdateInput,
} from '@socialincome/shared/src/database/services/recipient/recipient.types';
import { RecipientFormSchema } from './recipient-form';

// Helper to structure contact address for Prisma upsert/create
function buildAddressInput(contactFields: { [key: string]: FormField }) {
	return {
		street: contactFields.street.value,
		number: contactFields.number.value,
		city: contactFields.city.value,
		zip: contactFields.zip.value,
		country: contactFields.country.value,
	};
}

// Helper to build common contact fields for create/update
function buildCommonContactData(contactFields: { [key: string]: FormField }) {
	return {
		firstName: contactFields.firstName.value,
		lastName: contactFields.lastName.value,
		gender: contactFields.gender.value,
		email: contactFields.email.value || null,
		profession: contactFields.profession.value || null,
		dateOfBirth: contactFields.dateOfBirth.value,
		callingName: contactFields.callingName.value || null,
		language: contactFields.language.value || null,
	};
}

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
	// Payment Information Phone Upsert/Update Logic
	const paymentPhoneUpdate = paymentInfoFields.phone.value
		? {
				upsert: {
					update: { number: paymentInfoFields.phone.value },
					create: { number: paymentInfoFields.phone.value },
					where: { id: recipient.paymentInformation?.phone?.id },
				},
			}
		: undefined;
	// Contact Phone Update Logic
	const contactPhoneUpdate = contactFields.phone.value
		? {
				update: {
					data: { number: contactFields.phone.value },
					where: { id: recipient.contact.phone?.id },
				},
			}
		: undefined;
	// Contact Address Upsert Logic
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
					phone: paymentInfoFields.phone.value ? { create: { number: paymentInfoFields.phone.value } } : undefined,
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
				phone: paymentInfoFields.phone.value ? { create: { number: paymentInfoFields.phone.value } } : undefined,
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
