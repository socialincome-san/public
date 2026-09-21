/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	mapContactFormFields,
	normalizeNullableString,
	normalizeOptionalString,
} from '@/components/dynamic-form/contact-form-input-mapper';
import { FormField } from '@/components/dynamic-form/dynamic-form';
import type { CandidateCreateInput, CandidateUpdateInput } from '@/modules/candidates/candidate.schemas';
import type { CandidatePayload } from '@/modules/candidates/candidate.types';
import { CandidateFormSchema } from './candidates-form';

export const buildUpdateCandidateInput = (
	schema: CandidateFormSchema,
	candidate: CandidatePayload,
	contactFields: Record<string, FormField>,
): CandidateUpdateInput => {
	return {
		id: candidate.id,
		suspendedAt: schema.fields.suspendedAt.value ?? null,
		suspensionReason: normalizeNullableString(schema.fields.suspensionReason.value),
		successorName: normalizeNullableString(schema.fields.successorName.value),
		termsAccepted: schema.fields.termsAccepted.value ?? false,
		localPartnerId: normalizeOptionalString(schema.fields.localPartner?.value),
		contact: mapContactFormFields(contactFields, { email: 'nullable' }),
		paymentInformation: {
			mobileMoneyProviderId: normalizeOptionalString(schema.fields.paymentInformation.fields.provider.value),
			code: normalizeNullableString(schema.fields.paymentInformation.fields.code.value),
			phone: normalizeOptionalString(schema.fields.paymentInformation.fields.phone.value),
		},
	};
};

export const buildCreateCandidateInput = (
	schema: CandidateFormSchema,
	contactFields: Record<string, FormField>,
): CandidateCreateInput => {
	return {
		suspendedAt: schema.fields.suspendedAt.value ?? null,
		suspensionReason: normalizeNullableString(schema.fields.suspensionReason.value),
		successorName: normalizeNullableString(schema.fields.successorName.value),
		termsAccepted: schema.fields.termsAccepted.value ?? false,
		localPartnerId: normalizeOptionalString(schema.fields.localPartner?.value),
		contact: mapContactFormFields(contactFields, { email: 'nullable' }),
		paymentInformation: {
			mobileMoneyProviderId: normalizeOptionalString(schema.fields.paymentInformation.fields.provider.value),
			code: normalizeNullableString(schema.fields.paymentInformation.fields.code.value),
			phone: normalizeOptionalString(schema.fields.paymentInformation.fields.phone.value),
		},
	};
};
