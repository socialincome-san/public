import { Currency, PayoutStatus } from '@/generated/prisma/enums';
import { z } from 'zod';

const requiredIdSchema = z.string().trim().min(1, 'This field is required.');

const nullableNumberSchema = z.preprocess((value) => {
	if (value === '' || value === null || value === undefined) {
		return null;
	}

	return value;
}, z.coerce.number().nonnegative('CHF amount must be non-negative.').nullable());

const nullableTrimmedStringSchema = z.preprocess((value) => {
	if (typeof value !== 'string') {
		return value ?? null;
	}

	const trimmedValue = value.trim();

	return trimmedValue === '' ? null : trimmedValue;
}, z.string().nullable());

export const payoutCreateSchema = z.object({
	recipientId: requiredIdSchema,
	amount: z.coerce.number().nonnegative('Amount must be non-negative.'),
	amountChf: nullableNumberSchema,
	currency: z.nativeEnum(Currency),
	status: z.nativeEnum(PayoutStatus),
	paymentAt: z.coerce.date(),
	phoneNumber: nullableTrimmedStringSchema,
	comments: nullableTrimmedStringSchema,
});

export const payoutUpdateSchema = payoutCreateSchema.extend({
	id: requiredIdSchema,
});

export const payoutIdSchema = z.string().trim().min(1, 'Payout id is required.');

const tableQueryTokenSchema = z.string().trim().max(64).optional();

export const payoutTableQuerySchema = z.object({
	page: z.number().int().min(1),
	pageSize: z.number().int().min(1).max(1000),
	search: z.string().trim().max(120),
	sortBy: tableQueryTokenSchema,
	sortDirection: z.enum(['asc', 'desc']).optional(),
	programId: tableQueryTokenSchema,
	payoutStatus: tableQueryTokenSchema,
	mobileMoneyProviderId: tableQueryTokenSchema,
	recipientId: tableQueryTokenSchema,
});

export const payoutProgramIdSchema = z.string().trim().min(1, 'Invalid program id');

export const payoutCountryCodeSchema = z.string().trim().min(1, 'Missing isoCode');

export const payoutLocalPartnerSlugSchema = z.string().trim().min(1, 'Missing local partner slug');

export const payoutNoInputSchema = z.undefined();

export type CreatePayoutInput = z.infer<typeof payoutCreateSchema>;
export type UpdatePayoutInput = z.infer<typeof payoutUpdateSchema>;
