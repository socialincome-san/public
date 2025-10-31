import { Address, Gender, Phone } from '@prisma/client';
import { FormField } from './dynamic-form';

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
	contactFields: {
		[key: string]: FormField;
	},
): {
	[key: string]: FormField;
} => {
	contactFields.firstName.value = contact.firstName;
	contactFields.lastName.value = contact.lastName;
	contactFields.callingName.value = contact.callingName;
	contactFields.email.value = contact.email;
	contactFields.language.value = contact.language;
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

// Helper to structure contact address for Prisma upsert/create
export function buildAddressInput(contactFields: { [key: string]: FormField }) {
	return {
		street: contactFields.street.value,
		number: contactFields.number.value,
		city: contactFields.city.value,
		zip: contactFields.zip.value,
		country: contactFields.country.value,
	};
}

// Helper to build common contact fields for create/update
export function buildCommonContactData(contactFields: { [key: string]: FormField }) {
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

export type DropdownItem = {
	id: string;
	label: string;
};

export function getZodEnum(items: DropdownItem[]) {
	const object = items.reduce<Record<string, string>>((acc, item) => {
		acc[item.label] = item.id;
		return acc;
	}, {});

	return object;
}

type ExtractTypeFromObj<T> = T[keyof T];
