/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { CreatePayoutInput, UpdatePayoutInput } from '@/modules/payouts/payout.schemas';
import type { PayoutPayload } from '@/modules/payouts/payout.types';
import type { PayoutFormSchema } from './payout-form';

export const buildCreatePayoutInput = (schema: PayoutFormSchema): CreatePayoutInput => {
	return {
		recipientId: schema.fields.recipientId.value,
		amount: schema.fields.amount.value,
		amountChf: schema.fields.amountChf.value ?? null,
		currency: schema.fields.currency.value,
		paymentAt: schema.fields.paymentAt.value,
		status: schema.fields.status.value,
		phoneNumber: schema.fields.phoneNumber.value ?? null,
		comments: null,
	};
};

export const buildUpdatePayoutInput = (schema: PayoutFormSchema, existing: PayoutPayload): UpdatePayoutInput => {
	const data: UpdatePayoutInput = {
		id: existing.id,
		recipientId: existing.recipient.id,
		amount: schema.fields.amount.value,
		amountChf: schema.fields.amountChf.value ?? null,
		currency: schema.fields.currency.value,
		paymentAt: schema.fields.paymentAt.value,
		status: schema.fields.status.value,
		phoneNumber: schema.fields.phoneNumber.value ?? null,
		comments: existing.comments,
	};

	if (schema.fields.recipientId.value !== existing.recipient.id) {
		data.recipientId = schema.fields.recipientId.value;
	}

	return data;
};
