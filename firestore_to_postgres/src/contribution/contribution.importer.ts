import { PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';
import { ContributionWithPayment } from './contribution.types';

const prisma = new PrismaClient();

export class ContributionImporter extends BaseImporter<ContributionWithPayment> {
	import = async (contributions: ContributionWithPayment[]): Promise<number> => {
		let createdCount = 0;

		for (const data of contributions) {
			await prisma.contribution.create({ data: data.contribution });
			createdCount++;
		}

		return createdCount;
	};
}
