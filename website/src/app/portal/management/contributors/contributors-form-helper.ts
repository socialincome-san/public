/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { mapContactFormFields, normalizeNullableString } from '@/components/dynamic-form/contact-form-input-mapper';
import { FormField } from '@/components/dynamic-form/dynamic-form';
import type { CreateContributorInput, UpdateContributorInput } from '@/modules/contributors/contributor.schemas';
import type { ContributorPayload } from '@/modules/contributors/contributor.types';
import { ContributorFormSchema } from './contributors-form';

export const buildCreateContributorInput = (schema: ContributorFormSchema): CreateContributorInput => {
	const contactFields: Record<string, FormField> = schema.fields.contact.fields;

	return {
		referral: schema.fields.referral.value,
		paymentReferenceId: normalizeNullableString(schema.fields.paymentReferenceId.value),
		stripeCustomerId: normalizeNullableString(schema.fields.stripeCustomerId.value),
		contact: mapContactFormFields(contactFields, { email: 'required' }),
	};
};

export const buildUpdateContributorsInput = (
	schema: ContributorFormSchema,
	contributor: ContributorPayload,
): UpdateContributorInput => {
	const contactFields: Record<string, FormField> = schema.fields.contact.fields;

	return {
		id: contributor.id,
		referral: schema.fields.referral.value,
		paymentReferenceId: normalizeNullableString(schema.fields.paymentReferenceId.value),
		stripeCustomerId: normalizeNullableString(schema.fields.stripeCustomerId.value),
		contact: mapContactFormFields(contactFields, { email: 'required' }),
	};
};
