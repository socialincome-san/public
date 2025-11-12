import { PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';
import { ContributionWithPayment } from './contribution.types';

const prisma = new PrismaClient();

export class ContributionImporter extends BaseImporter<ContributionWithPayment> {
	import = async (contributions: ContributionWithPayment[]): Promise<number> => {
		let createdCount = 0;

		for (const data of contributions) {
			try {
				await prisma.contribution.create({ data: data.contribution });
				createdCount++;
			} catch (error: any) {
				if (error?.code === 'P2002' && error?.meta?.target?.includes('transaction_id')) {
					// Generate unique transaction ID for migration duplicate
					const originalTransactionId = data.contribution.paymentEvent?.create?.transactionId || 'unknown';
					const uniqueId = `migration_duplicate_${originalTransactionId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

					console.log(`⚠️ Migration duplicate transaction ID resolved: ${originalTransactionId} → ${uniqueId}`);

					if (data.contribution.paymentEvent?.create) {
						data.contribution.paymentEvent.create.transactionId = uniqueId;
					}

					await prisma.contribution.create({ data: data.contribution });
					createdCount++;
				} else {
					throw error;
				}
			}
		}

		return createdCount;
	};
}
