import { LocalPartnerPayload } from '@socialincome/shared/src/database/services/local-partner/local-partner.types';
import { FormField } from './dynamic-form';

export const getContactValuesFromPayload = (
	serviceResultData: LocalPartnerPayload,
	contactFields: {
		[key: string]: FormField;
	},
): {
	[key: string]: FormField;
} => {
	const { contact } = serviceResultData;
	contactFields.firstName.value = contact.firstName;
	contactFields.lastName.value = contact.lastName;
	contactFields.callingName.value = contact.callingName;
	contactFields.email.value = contact.email;
	contactFields.language.value = contact.language;
	contactFields.profession.value = contact.profession;
	contactFields.dateOfBirth.value = contact.dateOfBirth;
	contactFields.phone.value = contact.phone?.number;
	contactFields.gender.value = contact.gender?.toString();
	contactFields.street.value = contact.address?.street;
	contactFields.zip.value = contact.address?.zip;
	contactFields.city.value = contact.address?.city;
	contactFields.country.value = contact.address?.country;
	contactFields.number.value = contact.address?.number;

	return contactFields;
};
