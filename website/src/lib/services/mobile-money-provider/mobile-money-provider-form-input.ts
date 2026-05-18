import { PayoutProcess } from '@/generated/prisma/enums';
import z from 'zod';

const requiredTrimmedString = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const mobileMoneyProviderCreateInputSchema = z.object({
	name: requiredTrimmedString('Name'),
	payoutProcess: z.nativeEnum(PayoutProcess).optional().nullable(),
	parentId: z.string().trim().min(1).optional().nullable(),
});

export const mobileMoneyProviderUpdateInputSchema = mobileMoneyProviderCreateInputSchema.extend({
	id: requiredTrimmedString('Mobile money provider id'),
});

export type MobileMoneyProviderFormCreateInput = z.infer<typeof mobileMoneyProviderCreateInputSchema>;
export type MobileMoneyProviderFormUpdateInput = z.infer<typeof mobileMoneyProviderUpdateInputSchema>;
