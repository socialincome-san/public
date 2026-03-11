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

const mapContactFields = (contactFields: Record<string, FormField>) => ({
	firstName: asString(contactFields.firstName.value),
	lastName: asString(contactFields.lastName.value),
	callingName: asNullableString(contactFields.callingName.value),
	email: asString(contactFields.email.value),
	gender: contactFields.gender.value ?? null,
	language: asNullableString(contactFields.language.value),
	dateOfBirth: contactFields.dateOfBirth.value ?? null,
	profession: asNullableString(contactFields.profession.value),
	phone: asOptionalString(contactFields.phone.value),
	hasWhatsApp: !!contactFields.hasWhatsApp.value,
	street: asNullableString(contactFields.street.value),
	number: asNullableString(contactFields.number.value),
	city: asNullableString(contactFields.city.value),
	zip: asNullableString(contactFields.zip.value),
	country: contactFields.country.value ?? null,
});

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const asNullableString = (value: unknown): string | null => {
	if (typeof value !== 'string') {
		return value === null || value === undefined ? null : null;
	}
	const trimmedValue = value.trim();

	return trimmedValue === '' ? null : trimmedValue;
};

const asOptionalString = (value: unknown): string | undefined => {
	if (typeof value !== 'string') {
		return value === null || value === undefined ? undefined : undefined;
	}
	const trimmedValue = value.trim();

	return trimmedValue === '' ? undefined : trimmedValue;
};
