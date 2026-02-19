import { PayoutCreateInput, PayoutPayload, PayoutUpdateInput } from '@/lib/services/payout/payout.types';
import { PayoutFormSchema } from './payout-form';

export const buildCreatePayoutInput = (schema: PayoutFormSchema): PayoutCreateInput => {
	return {
		recipient: { connect: { id: schema.fields.recipientId.value } },
		amount: schema.fields.amount.value,
		currency: schema.fields.currency.value,
		paymentAt: schema.fields.paymentAt.value,
		status: schema.fields.status.value,
		phoneNumber: schema.fields.phoneNumber.value ?? null,
		comments: null,
	};
};

export const buildUpdatePayoutInput = (schema: PayoutFormSchema, existing: PayoutPayload): PayoutUpdateInput => {
	const data: PayoutUpdateInput = {
		id: existing.id,
		amount: schema.fields.amount.value,
		currency: schema.fields.currency.value,
		paymentAt: schema.fields.paymentAt.value,
		status: schema.fields.status.value,
		phoneNumber: schema.fields.phoneNumber.value ?? null,
		comments: existing.comments,
	};

	if (schema.fields.recipientId.value !== existing.recipient.id) {
		data.recipient = { connect: { id: schema.fields.recipientId.value } };
	}

	return data;
};
