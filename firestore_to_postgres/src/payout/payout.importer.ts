import { Prisma, PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';

const prisma = new PrismaClient();

export class PayoutImporter extends BaseImporter<Prisma.PayoutCreateInput> {
	import = async (payouts: Prisma.PayoutCreateInput[]): Promise<number> => {
		let createdCount = 0;

		for (const payout of payouts) {
			await prisma.payout.create({ data: payout });
			createdCount++;
		}

		return createdCount;
	};
}
