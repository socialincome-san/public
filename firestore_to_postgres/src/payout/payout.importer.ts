import { Prisma, PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';

const prisma = new PrismaClient();

export class PayoutImporter extends BaseImporter<Prisma.PayoutCreateInput> {
	import = async (payouts: Prisma.PayoutCreateInput[]): Promise<number> => {
		let createdCount = 0;

		for (const payout of payouts) {
			try {
				const recipientLegacyId = payout.recipient?.connect?.legacyFirestoreId;

				if (recipientLegacyId) {
					const exists = await prisma.recipient.findUnique({
						where: { legacyFirestoreId: recipientLegacyId },
					});
					if (!exists) continue;
				}

				await prisma.payout.create({ data: payout });
				createdCount++;
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				console.warn(`[PayoutImporter] Failed for ${payout.legacyFirestoreId}: ${message}`);
			}
		}

		return createdCount;
	};
}
