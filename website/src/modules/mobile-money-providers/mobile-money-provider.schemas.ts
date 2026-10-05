import { PayoutProcess } from '@/generated/prisma/enums';
import z from 'zod';

const requiredTrimmedString = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const mobileMoneyProviderCreateSchema = z.object({
	name: requiredTrimmedString('Name'),
	payoutProcess: z.nativeEnum(PayoutProcess).optional().nullable(),
	parentId: z.string().trim().min(1).optional().nullable(),
});

export const mobileMoneyProviderUpdateSchema = mobileMoneyProviderCreateSchema.extend({
	id: requiredTrimmedString('Mobile money provider id'),
});

export const mobileMoneyProviderIdSchema = requiredTrimmedString('Mobile money provider id');

export const mobileMoneyProviderSessionTypeSchema = z.enum(['user', 'local-partner', 'contributor']);

export type MobileMoneyProviderCreateInput = z.infer<typeof mobileMoneyProviderCreateSchema>;
export type MobileMoneyProviderUpdateInput = z.infer<typeof mobileMoneyProviderUpdateSchema>;
