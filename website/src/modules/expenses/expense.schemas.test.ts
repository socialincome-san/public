import { ExpenseType } from '@/generated/prisma/enums';
import { expenseCreateInputSchema, expenseUpdateInputSchema } from './expense.schemas';

describe('expense schemas', () => {
	test('coerces valid numeric input', () => {
		const result = expenseCreateInputSchema.safeParse({
			type: ExpenseType.administrative,
			year: '2026',
			amountChf: '125.50',
			organizationId: ' organization-1 ',
		});

		expect(result).toEqual({
			success: true,
			data: {
				type: ExpenseType.administrative,
				year: 2026,
				amountChf: 125.5,
				organizationId: 'organization-1',
			},
		});
	});

	test('rejects out-of-range years and missing update ids', () => {
		expect(
			expenseCreateInputSchema.safeParse({
				type: ExpenseType.administrative,
				year: 1999,
				amountChf: 100,
				organizationId: 'organization-1',
			}).success,
		).toBe(false);
		expect(
			expenseUpdateInputSchema.safeParse({
				type: ExpenseType.administrative,
				year: 2026,
				amountChf: 100,
				organizationId: 'organization-1',
			}).success,
		).toBe(false);
	});
});
