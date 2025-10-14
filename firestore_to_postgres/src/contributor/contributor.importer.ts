import { PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';
import { ContributorCreateInput } from './contributor.types';

const prisma = new PrismaClient();

export class ContributorImporter extends BaseImporter<ContributorCreateInput> {
	import = async (contributors: ContributorCreateInput[]): Promise<number> => {
		let createdCount = 0;

		for (const data of contributors) {
			try {
				await prisma.account.create({ data });
				createdCount++;
			} catch (error) {
				const email = data.contributor?.create?.contact?.create?.email ?? 'unknown';
				console.warn(`[ContributorImporter] Skipped contributor ${email}: ${error}`);
			}
		}

		return createdCount;
	};
}
