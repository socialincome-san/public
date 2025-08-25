import { Expense, ExpenseType } from '@prisma/client';

export const EXPENSE_COUNT = 5;

const makeExpense = (i: number, type: ExpenseType, year: number, amount: number): Expense => ({
	id: `expense-${i}`,
	type,
	year,
	amountChf: amount,
	createdAt: new Date(),
	updatedAt: null,
});

export const expensesData: Expense[] = [
	makeExpense(1, 'account_fees', 2023, 1200),
	makeExpense(2, 'administrative', 2023, 8500),
	makeExpense(3, 'delivery_fees', 2024, 4300),
	makeExpense(4, 'fundraising_advertising', 2024, 2750),
	makeExpense(5, 'staff', 2024, 15000),
];
