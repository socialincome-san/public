import { toPayoutProcess } from '@/lib/payout-process-options';
import type {
	MobileMoneyProviderCreateInput,
	MobileMoneyProviderUpdateInput,
} from '@/modules/mobile-money-providers/mobile-money-provider.schemas';
import type { MobileMoneyProviderPayload } from '@/modules/mobile-money-providers/mobile-money-provider.types';
import type { MobileMoneyProviderFormSchema } from './mobile-money-providers-form';

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');
const emptyToNull = (value: string): string | null => (value.trim().length > 0 ? value.trim() : null);

export const buildCreateMobileMoneyProviderInput = (
	schema: MobileMoneyProviderFormSchema,
): MobileMoneyProviderCreateInput => ({
	name: asString(schema.fields.name.value).trim(),
	payoutProcess: toPayoutProcess(asString(schema.fields.payoutProcess.value)),
	parentId: emptyToNull(asString(schema.fields.parentId.value)),
});

export const buildUpdateMobileMoneyProviderInput = (
	schema: MobileMoneyProviderFormSchema,
	existing: MobileMoneyProviderPayload,
): MobileMoneyProviderUpdateInput => ({
	id: existing.id,
	name: asString(schema.fields.name.value).trim() || existing.name,
	payoutProcess:
		schema.fields.payoutProcess.value === undefined
			? existing.payoutProcess
			: toPayoutProcess(asString(schema.fields.payoutProcess.value)),
	parentId:
		schema.fields.parentId.value === undefined ? existing.parentId : emptyToNull(asString(schema.fields.parentId.value)),
});
