import { FormField } from '@/components/dynamic-form/dynamic-form';
import {
	mapContactFormFields,
	normalizeNullableString,
	normalizeOptionalString,
} from '@/components/dynamic-form/contact-form-input-mapper';
import {
	RecipientFormCreateInput,
	RecipientFormUpdateInput,
} from '@/lib/services/recipient/recipient-form-input';
import { RecipientPayload } from '@/lib/services/recipient/recipient.types';
import { RecipientFormSchema } from './recipient-form';

export const buildUpdateRecipientInput = (
	schema: RecipientFormSchema,
	recipient: RecipientPayload,
	contactFields: { [key: string]: FormField },
): RecipientFormUpdateInput => {
	return {
		id: recipient.id,
		startDate: schema.fields.startDate.value ?? null,
		suspendedAt: schema.fields.suspendedAt.value ?? null,
		suspensionReason: normalizeNullableString(schema.fields.suspensionReason.value),
		successorName: normalizeNullableString(schema.fields.successorName.value),
		termsAccepted: schema.fields.termsAccepted.value ?? false,
		programId: normalizeOptionalString(schema.fields.program?.value),
		localPartnerId: normalizeOptionalString(schema.fields.localPartner?.value),
		contact: mapContactFormFields(contactFields, { email: 'nullable' }),
		paymentInformation: {
			mobileMoneyProviderId: normalizeOptionalString(schema.fields.paymentInformation.fields.provider.value),
			code: normalizeNullableString(schema.fields.paymentInformation.fields.code.value),
			phone: normalizeOptionalString(schema.fields.paymentInformation.fields.phone.value),
		},
	};
};

export const buildCreateRecipientInput = (
	schema: RecipientFormSchema,
	contactFields: { [key: string]: FormField },
): RecipientFormCreateInput => {
	return {
		startDate: schema.fields.startDate.value ?? null,
		suspendedAt: schema.fields.suspendedAt.value ?? null,
		suspensionReason: normalizeNullableString(schema.fields.suspensionReason.value),
		successorName: normalizeNullableString(schema.fields.successorName.value),
		termsAccepted: schema.fields.termsAccepted.value ?? false,
		programId: normalizeOptionalString(schema.fields.program?.value),
		localPartnerId: normalizeOptionalString(schema.fields.localPartner?.value),
		contact: mapContactFormFields(contactFields, { email: 'nullable' }),
		paymentInformation: {
			mobileMoneyProviderId: normalizeOptionalString(schema.fields.paymentInformation.fields.provider.value),
			code: normalizeNullableString(schema.fields.paymentInformation.fields.code.value),
			phone: normalizeOptionalString(schema.fields.paymentInformation.fields.phone.value),
		},
	};
};
