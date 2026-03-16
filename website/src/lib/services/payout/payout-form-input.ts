import { Currency, PayoutStatus } from '@/generated/prisma/enums';
import z from 'zod';

const requiredId = z.string().trim().min(1, 'This field is required.');

const payoutDate = z.preprocess((value) => {
	if (value === '' || value === null || value === undefined) {
		return value;
	}

	return value;
}, z.coerce.date());

export const payoutCreateInputSchema = z.object({
	recipientId: requiredId,
	amount: z.coerce.number().nonnegative('Amount must be non-negative.'),
	currency: z.nativeEnum(Currency),
	status: z.nativeEnum(PayoutStatus),
	paymentAt: payoutDate,
	phoneNumber: z.preprocess((value) => {
		if (typeof value !== 'string') {
			return value ?? null;
		}
		const trimmedValue = value.trim();

		return trimmedValue === '' ? null : trimmedValue;
	}, z.string().nullable()),
	comments: z.preprocess((value) => {
		if (typeof value !== 'string') {
			return value ?? null;
		}
		const trimmedValue = value.trim();

		return trimmedValue === '' ? null : trimmedValue;
	}, z.string().nullable()),
});

export const payoutUpdateInputSchema = payoutCreateInputSchema.extend({
	id: requiredId,
});

export type PayoutFormCreateInput = z.infer<typeof payoutCreateInputSchema>;
export type PayoutFormUpdateInput = z.infer<typeof payoutUpdateInputSchema>;
