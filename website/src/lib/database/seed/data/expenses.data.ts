import { Expense, ExpenseType, Prisma } from '@/generated/prisma/client';

export const expensesData: Expense[] = [
	{
		id: 'expense-si-sl-2024',
		legacyFirestoreId: null,
		organizationId: 'org-si-sl',
		type: ExpenseType.administrative,
		year: 2024,
		amountChf: new Prisma.Decimal(1400),
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'expense-si-gh-2024',
		legacyFirestoreId: null,
		organizationId: 'org-si-gh',
		type: ExpenseType.staff,
		year: 2024,
		amountChf: new Prisma.Decimal(2200),
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'expense-si-lr-2024',
		legacyFirestoreId: null,
		organizationId: 'org-si-lr',
		type: ExpenseType.donation_fees,
		year: 2024,
		amountChf: new Prisma.Decimal(900),
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'expense-somaha-2024',
		legacyFirestoreId: null,
		organizationId: 'org-somaha',
		type: ExpenseType.fundraising_advertising,
		year: 2024,
		amountChf: new Prisma.Decimal(700),
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
];
