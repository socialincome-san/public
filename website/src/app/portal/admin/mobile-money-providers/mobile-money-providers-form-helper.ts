import type {
	MobileMoneyProviderFormCreateInput,
	MobileMoneyProviderFormUpdateInput,
} from '@/lib/services/mobile-money-provider/mobile-money-provider-form-input';
import type { MobileMoneyProviderPayload } from '@/lib/services/mobile-money-provider/mobile-money-provider.types';
import type { MobileMoneyProviderFormSchema } from './mobile-money-providers-form';

export const buildCreateMobileMoneyProviderInput = (
	schema: MobileMoneyProviderFormSchema,
): MobileMoneyProviderFormCreateInput => ({
	name: `${schema.fields.name.value ?? ''}`.trim(),
	isSupported: schema.fields.isSupported.value ?? false,
});

export const buildUpdateMobileMoneyProviderInput = (
	schema: MobileMoneyProviderFormSchema,
	existing: MobileMoneyProviderPayload,
): MobileMoneyProviderFormUpdateInput => ({
	id: existing.id,
	name: `${schema.fields.name.value ?? existing.name}`.trim(),
	isSupported: schema.fields.isSupported.value ?? existing.isSupported,
});
