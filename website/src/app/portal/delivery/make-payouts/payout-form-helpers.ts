/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PayoutFormCreateInput, PayoutFormUpdateInput } from '@/lib/services/payout/payout-form-input';
import { PayoutPayload } from '@/lib/services/payout/payout.types';
import { PayoutFormSchema } from './payout-form';

export const buildCreatePayoutInput = (schema: PayoutFormSchema): PayoutFormCreateInput => {
	return {
		recipientId: schema.fields.recipientId.value,
		amount: schema.fields.amount.value,
		currency: schema.fields.currency.value,
		paymentAt: schema.fields.paymentAt.value,
		status: schema.fields.status.value,
		phoneNumber: schema.fields.phoneNumber.value ?? null,
		comments: null,
	};
};

export const buildUpdatePayoutInput = (schema: PayoutFormSchema, existing: PayoutPayload): PayoutFormUpdateInput => {
	const data: PayoutFormUpdateInput = {
		id: existing.id,
		recipientId: existing.recipient.id,
		amount: schema.fields.amount.value,
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
