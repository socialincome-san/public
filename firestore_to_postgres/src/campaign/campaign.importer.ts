import { PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';
import { CampaignCreateInput } from './campaign.types';

const prisma = new PrismaClient();

export class CampaignImporter extends BaseImporter<CampaignCreateInput> {
	import = async (campaigns: CampaignCreateInput[]): Promise<number> => {
		let createdCount = 0;

		for (const data of campaigns) {
			try {
				await prisma.campaign.create({ data });
				createdCount++;
			} catch (error) {
				console.warn(`[CampaignImporter] Skipped campaign "${data.title}": ${(error as Error).message}`);
			}
		}

		return createdCount;
	};
}
