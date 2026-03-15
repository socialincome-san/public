import z from 'zod';

const requiredTrimmedString = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const mobileMoneyProviderCreateInputSchema = z.object({
	name: requiredTrimmedString('Name'),
	isSupported: z.boolean().optional().default(false),
});

export const mobileMoneyProviderUpdateInputSchema = mobileMoneyProviderCreateInputSchema.extend({
	id: requiredTrimmedString('Mobile money provider id').optional(),
});

export type MobileMoneyProviderFormCreateInput = z.infer<typeof mobileMoneyProviderCreateInputSchema>;
export type MobileMoneyProviderFormUpdateInput = z.infer<typeof mobileMoneyProviderUpdateInputSchema>;
