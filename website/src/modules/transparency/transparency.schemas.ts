import { z } from 'zod';

const transparencyFinancialPeriodSchema = z.discriminatedUnion('kind', [
	z.object({ kind: z.literal('all-time') }),
	z.object({ kind: z.literal('ytd') }),
	z.object({ kind: z.literal('year'), year: z.number().int() }),
]);

export const transparencyCountriesInputSchema = z.object({
	limit: z.number().finite().optional(),
	financialPeriod: transparencyFinancialPeriodSchema.optional(),
});
