import { FormField } from '@/components/dynamic-form/dynamic-form';
import { buildAddressInput, buildCommonContactData } from '@/components/dynamic-form/helper';
import {
	ContributorPayload,
	ContributorUpdateInput,
} from '@socialincome/shared/src/database/services/contributor/contributor.types';
import { ContributorFormSchema } from './contributors-form';

export function buildUpdateContributorsInput(
	schema: ContributorFormSchema,
	contributor: ContributorPayload,
): ContributorUpdateInput {
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
					address: {
						upsert: {
							update: addressUpdate,
							create: addressUpdate,
							where: { id: contributor.contact.address?.id },
						},
					},
				},
				where: { id: contributor.contact.id },
			},
		},
	};
}
