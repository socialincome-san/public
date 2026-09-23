import { z } from 'zod';

export const payoutProcessDateSchema = z.object({
	selectedDate: z.date(),
});

export const orangeMoneyPayoutProcessSchema = payoutProcessDateSchema.extend({
	mobileMoneyProviderId: z.string().trim().min(1, 'Mobile money provider id is required.'),
});

export const orangeMoneyRegistrationPayoutProcessSchema = z.object({
	mobileMoneyProviderId: z.string().trim().min(1, 'Mobile money provider id is required.'),
});

export type PayoutProcessDateInput = z.infer<typeof payoutProcessDateSchema>;
export type OrangeMoneyPayoutProcessInput = z.infer<typeof orangeMoneyPayoutProcessSchema>;
export type OrangeMoneyRegistrationPayoutProcessInput = z.infer<typeof orangeMoneyRegistrationPayoutProcessSchema>;
