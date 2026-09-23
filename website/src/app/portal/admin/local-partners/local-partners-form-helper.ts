/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { mapContactFormFields } from '@/components/dynamic-form/contact-form-input-mapper';
import { FormField } from '@/components/dynamic-form/dynamic-form';
import { type LocalPartnerCreateInput, type LocalPartnerUpdateInput } from '@/modules/local-partners/local-partner.schemas';
import type { LocalPartnerPayload } from '@/modules/local-partners/local-partner.types';
import { LocalPartnerFormSchema } from './local-partners-form';

export const buildUpdateLocalPartnerInput = (
	schema: LocalPartnerFormSchema,
	localPartner: LocalPartnerPayload,
	contactFields: Record<string, FormField>,
): LocalPartnerUpdateInput => {
	return {
		id: localPartner.id,
		name: schema.fields.name.value,
		slug: schema.fields.slug.value,
		focuses: schema.fields.focuses.value ?? [],
		contact: mapContactFormFields(contactFields, { email: 'required' }),
	};
};

export const buildCreateLocalPartnerInput = (
	schema: LocalPartnerFormSchema,
	contactFields: Record<string, FormField>,
): LocalPartnerCreateInput => {
	return {
		name: schema.fields.name.value,
		slug: schema.fields.slug.value,
		focuses: schema.fields.focuses.value ?? [],
		contact: mapContactFormFields(contactFields, { email: 'required' }),
	};
};
