import { Prisma, PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';

const prisma = new PrismaClient();

export class ExpenseImporter extends BaseImporter<Prisma.ExpenseCreateInput> {
	import = async (expenses: Prisma.ExpenseCreateInput[]): Promise<number> => {
		let createdCount = 0;

		for (const expense of expenses) {
			await prisma.expense.create({ data: expense });
			createdCount++;
		}

		return createdCount;
	};
}
