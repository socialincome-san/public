import { Prisma, PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';

const prisma = new PrismaClient();

export class ExchangeRateImporter extends BaseImporter<Prisma.ExchangeRateCreateInput> {
	import = async (rates: Prisma.ExchangeRateCreateInput[]): Promise<number> => {
		let createdCount = 0;

		for (const rate of rates) {
			await prisma.exchangeRate.create({ data: rate });
			createdCount++;
		}

		return createdCount;
	};
}
