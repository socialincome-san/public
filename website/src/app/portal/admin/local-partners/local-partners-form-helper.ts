import { FormField } from '@/components/dynamic-form/dynamic-form';
import { buildAddressInput, buildCommonContactData } from '@/components/dynamic-form/helper';
import {
  LocalPartnerCreateInput,
  LocalPartnerPayload,
  LocalPartnerUpdateInput,
} from '@/lib/services/local-partner/local-partner.types';
import { LocalPartnerFormSchema } from './local-partners-form';

export const buildUpdateLocalPartnerInput = (
  schema: LocalPartnerFormSchema,
  localPartner: LocalPartnerPayload,
  contactFields: Record<string, FormField>,
): LocalPartnerUpdateInput => {
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
    causes: schema.fields.causes.value,
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
                where: { id: localPartner.contact.address?.id },
              },
            },
          }),
        },
        where: { id: localPartner.contact.id },
      },
    },
  };
};

export const buildCreateLocalPartnerInput = (
  schema: LocalPartnerFormSchema,
  contactFields: Record<string, FormField>,
): LocalPartnerCreateInput => {
  const addressInput = buildAddressInput(contactFields);

  return {
    name: schema.fields.name.value,
    causes: schema.fields.causes.value,
    contact: {
      create: {
        ...buildCommonContactData(contactFields),
        phone: contactFields.phone.value ? { create: { number: contactFields.phone.value } } : undefined,
        ...(addressInput && {
          address: { create: addressInput },
        }),
      },
    },
  };
};
