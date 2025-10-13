import { Prisma, PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';

const prisma = new PrismaClient();

export class ExchangeRateImporter extends BaseImporter<Prisma.ExchangeRateCreateInput> {
	import = async (rates: Prisma.ExchangeRateCreateInput[]): Promise<number> => {
		let createdCount = 0;

		for (const rate of rates) {
			try {
				await prisma.exchangeRate.create({ data: rate });
				createdCount++;
			} catch (error) {
				const legacyId = rate.legacyFirestoreId ?? 'unknown';
				const message = error instanceof Error ? error.message : String(error);
				console.error(`[ExchangeRateImporter] Failed to import rate ${legacyId}: ${message}`);
			}
		}

		return createdCount;
	};
}
