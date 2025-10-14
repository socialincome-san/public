import { Prisma, PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';

const prisma = new PrismaClient();

export class ExpenseImporter extends BaseImporter<Prisma.ExpenseCreateInput> {
	import = async (expenses: Prisma.ExpenseCreateInput[]): Promise<number> => {
		let createdCount = 0;

		for (const expense of expenses) {
			try {
				await prisma.expense.create({ data: expense });
				createdCount++;
			} catch (error) {
				const id = (expense.legacyFirestoreId as string) ?? 'unknown';
				const message = error instanceof Error ? error.message : 'Unknown error';
				console.error(`[ExpenseImporter] Failed to import expense ${id}: ${message}`);
			}
		}

		return createdCount;
	};
}
