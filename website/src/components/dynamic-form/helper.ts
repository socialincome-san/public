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

export type DropdownItem = {
	id: string;
	label: string;
};

export function getZodEnum(items: DropdownItem[]) {
	const object = items.reduce((acc, item) => {
		acc[item.label] = item.id;
		return acc;
	}, {});

	return object;
}

type ExtractTypeFromObj<T> = T[keyof T];

// const objectToEnum = <T extends object>(obj: T) => {
// 	type EnumType = ExtractTypeFromObj<typeof obj>;

// 	return Object.values(obj) as [EnumType, ...EnumType[]];
// };
