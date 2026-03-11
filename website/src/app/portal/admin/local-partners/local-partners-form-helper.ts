import { mapContactFormFields } from '@/components/dynamic-form/contact-form-input-mapper';
import { FormField } from '@/components/dynamic-form/dynamic-form';
import {
	LocalPartnerFormCreateInput,
	LocalPartnerFormUpdateInput,
} from '@/lib/services/local-partner/local-partner-form-input';
import { LocalPartnerPayload } from '@/lib/services/local-partner/local-partner.types';
import { LocalPartnerFormSchema } from './local-partners-form';

export const buildUpdateLocalPartnerInput = (
	schema: LocalPartnerFormSchema,
	localPartner: LocalPartnerPayload,
	contactFields: Record<string, FormField>,
): LocalPartnerFormUpdateInput => {
	return {
		id: localPartner.id,
		name: schema.fields.name.value,
		causes: schema.fields.causes.value ?? [],
		contact: mapContactFormFields(contactFields, { email: 'required' }),
	};
};

export const buildCreateLocalPartnerInput = (
	schema: LocalPartnerFormSchema,
	contactFields: Record<string, FormField>,
): LocalPartnerFormCreateInput => {
	return {
		name: schema.fields.name.value,
		causes: schema.fields.causes.value ?? [],
		contact: mapContactFormFields(contactFields, { email: 'required' }),
	};
};
