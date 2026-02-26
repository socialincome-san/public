import type {
	MobileMoneyProviderCreateInput,
	MobileMoneyProviderPayload,
	MobileMoneyProviderUpdateInput,
} from '@/lib/services/mobile-money-provider/mobile-money-provider.types';
import type { MobileMoneyProviderFormSchema } from './mobile-money-providers-form';

export const buildCreateMobileMoneyProviderInput = (
	schema: MobileMoneyProviderFormSchema,
): MobileMoneyProviderCreateInput => ({
	name: schema.fields.name.value ?? '',
	isSupported: schema.fields.isSupported.value ?? false,
});

export const buildUpdateMobileMoneyProviderInput = (
	schema: MobileMoneyProviderFormSchema,
	existing: MobileMoneyProviderPayload,
): MobileMoneyProviderUpdateInput => ({
	id: existing.id,
	name: schema.fields.name.value ?? existing.name,
	isSupported: schema.fields.isSupported.value ?? existing.isSupported,
});
