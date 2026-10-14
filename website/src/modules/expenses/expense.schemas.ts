import { ExpenseType } from '@/generated/prisma/enums';
import { tableQueryFilterSchema, tableQuerySchema } from '@/lib/table-query-schema';
import { z } from 'zod';

const requiredTrimmedString = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const expenseCreateInputSchema = z.object({
	type: z.nativeEnum(ExpenseType),
	year: z.coerce
		.number()
		.int()
		.min(2000, 'Year must be between 2000 and 2100.')
		.max(2100, 'Year must be between 2000 and 2100.'),
	amountChf: z.coerce.number().min(0, 'Amount CHF must be zero or greater.'),
	organizationId: requiredTrimmedString('Organization'),
});

export const expenseUpdateInputSchema = expenseCreateInputSchema.extend({
	id: requiredTrimmedString('Expense id'),
});

export const expenseIdSchema = requiredTrimmedString('Expense id');

export const expenseTableQuerySchema = tableQuerySchema.extend({
	organizationId: tableQueryFilterSchema,
});

export type ExpenseCreateInput = z.infer<typeof expenseCreateInputSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateInputSchema>;
