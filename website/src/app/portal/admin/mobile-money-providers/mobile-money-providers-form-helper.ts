/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {
	MobileMoneyProviderFormCreateInput,
	MobileMoneyProviderFormUpdateInput,
} from '@/lib/services/mobile-money-provider/mobile-money-provider-form-input';
import type { MobileMoneyProviderPayload } from '@/lib/services/mobile-money-provider/mobile-money-provider.types';
import type { MobileMoneyProviderFormSchema } from './mobile-money-providers-form';

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');
const emptyToNull = (value: string): string | null => (value.trim().length > 0 ? value.trim() : null);

export const buildCreateMobileMoneyProviderInput = (
	schema: MobileMoneyProviderFormSchema,
): MobileMoneyProviderFormCreateInput => ({
	name: asString(schema.fields.name.value).trim(),
	isSupported: schema.fields.isSupported.value ?? false,
	parentId: emptyToNull(asString(schema.fields.parentId.value)),
});

export const buildUpdateMobileMoneyProviderInput = (
	schema: MobileMoneyProviderFormSchema,
	existing: MobileMoneyProviderPayload,
): MobileMoneyProviderFormUpdateInput => ({
	id: existing.id,
	name: asString(schema.fields.name.value).trim() || existing.name,
	isSupported: schema.fields.isSupported.value ?? existing.isSupported,
	parentId: schema.fields.parentId.value === undefined ? existing.parentId : emptyToNull(asString(schema.fields.parentId.value)),
});
