import { Prisma } from '@prisma/client';
import { DEFAULT_ORGANIZATION } from '../../scripts/seed-defaults';
import { BaseTransformer } from '../core/base.transformer';
import { FirestoreExpense } from './expense.types';

export class ExpenseTransformer extends BaseTransformer<FirestoreExpense, Prisma.ExpenseCreateInput> {
	transform = async (input: FirestoreExpense[]): Promise<Prisma.ExpenseCreateInput[]> => {
		return input.map(
			(entry): Prisma.ExpenseCreateInput => ({
				legacyFirestoreId: entry.id,
				type: entry.type,
				year: entry.year,
				amountChf: new Prisma.Decimal(entry.amount_chf ?? 0),
				organization: { connect: { name: DEFAULT_ORGANIZATION.name } },
			}),
		);
	};
}
