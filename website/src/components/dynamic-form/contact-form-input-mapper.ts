import { FormField } from './dynamic-form';

type ContactFormInputBase = {
	firstName: string;
	lastName: string;
	callingName: string | null;
	gender: FormField['value'] | null;
	language: string | null;
	dateOfBirth: Date | null;
	profession: string | null;
	phone: string | undefined;
	hasWhatsApp: boolean;
	street: string | null;
	number: string | null;
	city: string | null;
	zip: string | null;
	country: FormField['value'] | null;
};

type ContactFormInputWithRequiredEmail = ContactFormInputBase & {
	email: string;
};

type ContactFormInputWithNullableEmail = ContactFormInputBase & {
	email: string | null;
};

export const normalizeNullableString = (value: unknown): string | null => {
	if (typeof value !== 'string') {
		return value == null ? null : String(value);
	}
	const trimmedValue = value.trim();
	return trimmedValue === '' ? null : trimmedValue;
};

export const normalizeOptionalString = (value: unknown): string | undefined => {
	if (typeof value !== 'string') {
		return value == null ? undefined : String(value);
	}
	const trimmedValue = value.trim();
	return trimmedValue === '' ? undefined : trimmedValue;
};

type MapContactFormFields = {
	(contactFields: { [key: string]: FormField }, options: { email: 'required' }): ContactFormInputWithRequiredEmail;
	(contactFields: { [key: string]: FormField }, options: { email: 'nullable' }): ContactFormInputWithNullableEmail;
};

const mapContactFormFieldsImpl = (
	contactFields: { [key: string]: FormField },
	options: { email: 'required' | 'nullable' },
): ContactFormInputWithRequiredEmail | ContactFormInputWithNullableEmail => {
	const base: ContactFormInputBase = {
		firstName: `${contactFields.firstName.value ?? ''}`,
		lastName: `${contactFields.lastName.value ?? ''}`,
		callingName: normalizeNullableString(contactFields.callingName.value),
		gender: contactFields.gender.value ?? null,
		language: normalizeNullableString(contactFields.language.value),
		dateOfBirth: (contactFields.dateOfBirth.value as Date | null | undefined) ?? null,
		profession: normalizeNullableString(contactFields.profession.value),
		phone: normalizeOptionalString(contactFields.phone.value),
		hasWhatsApp: !!contactFields.hasWhatsApp.value,
		street: normalizeNullableString(contactFields.street.value),
		number: normalizeNullableString(contactFields.number.value),
		city: normalizeNullableString(contactFields.city.value),
		zip: normalizeNullableString(contactFields.zip.value),
		country: contactFields.country.value ?? null,
	};

	if (options.email === 'required') {
		return {
			...base,
			email: `${contactFields.email.value ?? ''}`,
		};
	}

	return {
		...base,
		email: normalizeNullableString(contactFields.email.value),
	};
};

export const mapContactFormFields = mapContactFormFieldsImpl as MapContactFormFields;
