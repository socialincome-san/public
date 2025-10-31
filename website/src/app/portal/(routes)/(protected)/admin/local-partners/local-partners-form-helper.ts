import { FormField } from '@/components/dynamic-form/dynamic-form';
import { buildAddressInput, buildCommonContactData } from '@/components/dynamic-form/helper';
import {
	LocalPartnerCreateInput,
	LocalPartnerPayload,
	LocalPartnerUpdateInput,
} from '@socialincome/shared/src/database/services/local-partner/local-partner.types';
import { LocalPartnerFormSchema } from './local-partners-form';

export function buildUpdateLocalPartnerInput(
	schema: LocalPartnerFormSchema,
	localPartner: LocalPartnerPayload,
	contactFields: { [key: string]: FormField },
): LocalPartnerUpdateInput {
	// Contact Phone Update Logic
	const contactPhoneUpdate = contactFields.phone.value
		? {
				update: {
					data: { number: contactFields.phone.value },
					where: { id: localPartner.contact.phone?.id },
				},
			}
		: undefined;
	// Contact Address Upsert Logic
	const addressUpdate = buildAddressInput(contactFields);
	return {
		id: localPartner.id,
		name: schema.fields.name.value,
		contact: {
			update: {
				data: {
					...buildCommonContactData(contactFields),
					phone: contactPhoneUpdate,
					address: {
						upsert: {
							update: addressUpdate,
							create: addressUpdate,
							where: { id: localPartner.contact.address?.id },
						},
					},
				},
				where: { id: localPartner.contact.id },
			},
		},
	};
}

export function buildCreateLocalPartnerInput(
	schema: LocalPartnerFormSchema,
	contactFields: { [key: string]: FormField },
): LocalPartnerCreateInput {
	return {
		name: schema.fields.name.value,
		contact: {
			create: {
				...buildCommonContactData(contactFields),
				phone: contactFields.phone.value ? { create: { number: contactFields.phone.value } } : undefined,
				address: { create: buildAddressInput(contactFields) },
			},
		},
	};
}
