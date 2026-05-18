import type {
	MobileMoneyProviderFormCreateInput,
	MobileMoneyProviderFormUpdateInput,
} from '@/lib/services/mobile-money-provider/mobile-money-provider-form-input';
import type { MobileMoneyProviderPayload } from '@/lib/services/mobile-money-provider/mobile-money-provider.types';
import { toPayoutProcess } from '@/lib/services/mobile-money-provider/payout-process-options';
import type { MobileMoneyProviderFormSchema } from './mobile-money-providers-form';

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');
const emptyToNull = (value: string): string | null => (value.trim().length > 0 ? value.trim() : null);

export const buildCreateMobileMoneyProviderInput = (
	schema: MobileMoneyProviderFormSchema,
): MobileMoneyProviderFormCreateInput => ({
	name: asString(schema.fields.name.value).trim(),
	payoutProcess: toPayoutProcess(asString(schema.fields.payoutProcess.value)),
	parentId: emptyToNull(asString(schema.fields.parentId.value)),
});

export const buildUpdateMobileMoneyProviderInput = (
	schema: MobileMoneyProviderFormSchema,
	existing: MobileMoneyProviderPayload,
): MobileMoneyProviderFormUpdateInput => ({
	id: existing.id,
	name: asString(schema.fields.name.value).trim() || existing.name,
	payoutProcess:
		schema.fields.payoutProcess.value === undefined
			? existing.payoutProcess
			: toPayoutProcess(asString(schema.fields.payoutProcess.value)),
	parentId:
		schema.fields.parentId.value === undefined ? existing.parentId : emptyToNull(asString(schema.fields.parentId.value)),
});
