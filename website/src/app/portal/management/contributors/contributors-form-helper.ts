import { mapContactFormFields, normalizeNullableString } from '@/components/dynamic-form/contact-form-input-mapper';
import { FormField } from '@/components/dynamic-form/dynamic-form';
import {
	ContributorFormCreateInput,
	ContributorFormUpdateInput,
} from '@/lib/services/contributor/contributor-form-input';
import { ContributorPayload } from '@/lib/services/contributor/contributor.types';
import { ContributorFormSchema } from './contributors-form';

export const buildCreateContributorInput = (schema: ContributorFormSchema): ContributorFormCreateInput => {
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
): ContributorFormUpdateInput => {
	const contactFields: {
		[key: string]: FormField;
	} = schema.fields.contact.fields;

	return {
		id: contributor.id,
		referral: schema.fields.referral.value,
		paymentReferenceId: normalizeNullableString(schema.fields.paymentReferenceId.value),
		stripeCustomerId: normalizeNullableString(schema.fields.stripeCustomerId.value),
		contact: mapContactFormFields(contactFields, { email: 'required' }),
	};
};
