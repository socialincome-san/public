import { FormField } from '@/components/dynamic-form/dynamic-form';
import { buildAddressInput, buildCommonContactData } from '@/components/dynamic-form/helper';
import {
	ContributorFormCreateInput,
	ContributorPayload,
	ContributorUpdateInput,
} from '@/lib/services/contributor/contributor.types';
import { ContributorFormSchema } from './contributors-form';

export const buildCreateContributorInput = (schema: ContributorFormSchema): ContributorFormCreateInput => {
	const contactFields: {
		[key: string]: FormField;
	} = schema.fields.contact.fields;

	const addressInput = buildAddressInput(contactFields);

	return {
		firstName: contactFields.firstName.value ?? '',
		lastName: contactFields.lastName.value ?? '',
		callingName: contactFields.callingName.value ?? null,
		email: contactFields.email.value ?? '',

		referral: schema.fields.referral.value,

		gender: contactFields.gender.value,
		language: contactFields.language.value,
		dateOfBirth: contactFields.dateOfBirth.value,
		profession: contactFields.profession.value,

		...(addressInput && { address: addressInput }),
	};
}

export const buildUpdateContributorsInput = (
	schema: ContributorFormSchema,
	contributor: ContributorPayload,
): ContributorUpdateInput => {
	const contactFields: {
		[key: string]: FormField;
	} = schema.fields.contact.fields;

	// Contact Phone Update Logic
	const contactPhoneUpdate = contactFields.phone.value
		? {
				update: {
					data: { number: contactFields.phone.value },
					where: { id: contributor.contact.phone?.id },
				},
			}
		: undefined;

	// Contact Address Upsert Logic
	const addressUpdate = buildAddressInput(contactFields);

	return {
		referral: schema.fields.referral.value,
		paymentReferenceId: schema.fields.paymentReferenceId.value,
		stripeCustomerId: schema.fields.stripeCustomerId.value,
		contact: {
			update: {
				data: {
					...buildCommonContactData(contactFields),
					phone: contactPhoneUpdate,
					...(addressUpdate && {
						address: {
							upsert: {
								update: addressUpdate,
								create: addressUpdate,
								where: { id: contributor.contact.address?.id },
							},
						},
					}),
				},
				where: { id: contributor.contact.id },
			},
		},
	};
}
