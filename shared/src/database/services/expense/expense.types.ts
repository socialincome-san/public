import { Expense as PrismaExpense } from '@prisma/client';

export type CreateExpenseInput = Omit<PrismaExpense, 'id' | 'createdAt' | 'updatedAt'>;
