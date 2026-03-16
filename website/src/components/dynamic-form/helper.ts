import { Address, Gender, Phone } from '@/generated/prisma/client';
import { FormField, FormSchema } from './dynamic-form';

type Contact = {
	id: string;
	firstName: string;
	lastName: string;
	callingName: string | null;
	email: string | null;
	gender: Gender | null;
	language: string | null;
	dateOfBirth: Date | null;
	profession: string | null;
	phone: Phone | null;
	address: Address | null;
};

export const getContactValuesFromPayload = (
	contact: Contact,
	contactFields: Record<string, FormField>,
): Record<string, FormField> => {
	contactFields.firstName.value = contact.firstName;
	contactFields.lastName.value = contact.lastName;
	contactFields.callingName.value = contact.callingName;
	contactFields.email.value = contact.email;
	contactFields.language.value = contact.language || null;
	contactFields.profession.value = contact.profession;
	contactFields.dateOfBirth.value = contact.dateOfBirth ?? undefined;
	contactFields.phone.value = contact.phone?.number;
	contactFields.hasWhatsApp.value = contact.phone?.hasWhatsApp;
	contactFields.gender.value = contact.gender?.toString();
	contactFields.street.value = contact.address?.street;
	contactFields.zip.value = contact.address?.zip;
	contactFields.city.value = contact.address?.city;
	contactFields.country.value = contact.address?.country;
	contactFields.number.value = contact.address?.number;

	return contactFields;
};

type DropdownItem = {
	id: string;
	label: string;
};

export const getZodEnum = (items: DropdownItem[]) => {
	const object = items.reduce<Record<string, string>>((acc, item) => {
		acc[item.label] = item.id;

		return acc;
	}, {});

	return object;
};

export const cloneFormSchema = <TSchema extends FormSchema>(schema: TSchema): TSchema => {
	const clonedFields = Object.fromEntries(
		Object.entries(schema.fields).map(([key, field]) => [
			key,
			'fields' in field ? cloneFormSchema(field) : { ...field },
		]),
	) as TSchema['fields'];

	return {
		...schema,
		fields: clonedFields,
	};
};

export const clearFormSchemaValues = <TSchema extends FormSchema>(schema: TSchema): TSchema => {
	const clearedFields = Object.fromEntries(
		Object.entries(schema.fields).map(([key, field]) => [
			key,
			'fields' in field ? clearFormSchemaValues(field) : { ...field, value: undefined },
		]),
	) as TSchema['fields'];

	return {
		...schema,
		fields: clearedFields,
	};
};
