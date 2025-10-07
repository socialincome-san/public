import { Expense, ExpenseType, Prisma } from '@prisma/client';

export const expensesData: Expense[] = [
	{
		id: 'expense-1',
		organizationId: 'organization-1',
		type: ExpenseType.administrative,
		year: 2024,
		amountChf: new Prisma.Decimal(1200),
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'expense-2',
		organizationId: 'organization-2',
		type: ExpenseType.staff,
		year: 2024,
		amountChf: new Prisma.Decimal(2500),
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'expense-3',
		organizationId: 'organization-3',
		type: ExpenseType.donation_fees,
		year: 2024,
		amountChf: new Prisma.Decimal(800),
		createdAt: new Date(),
		updatedAt: null
	}
];