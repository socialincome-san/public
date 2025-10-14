import { Prisma } from '@prisma/client';
import { Expense } from '@socialincome/shared/src/types/expense';

export const EXPENSES_FIRESTORE_PATH = 'expenses';

export type FirestoreExpense = Expense & { id: string; legacyFirestoreId: string };
export type ExpenseCreateInput = Prisma.ExpenseCreateInput;
