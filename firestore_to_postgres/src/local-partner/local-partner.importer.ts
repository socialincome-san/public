import { PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';
import { LocalPartnerCreateInput } from './local-partner.types';

const prisma = new PrismaClient();

export class LocalPartnerImporter extends BaseImporter<LocalPartnerCreateInput> {
	import = async (partners: LocalPartnerCreateInput[]): Promise<number> => {
		let createdCount = 0;

		for (const data of partners) {
			try {
				await prisma.localPartner.create({ data });
				createdCount++;
			} catch (error) {
				const email = data.contact.create?.email ?? 'unknown';
				console.warn(`[LocalPartnerImporter] Skipped local partner ${data.name} (${email}): ${error}`);
			}
		}

		return createdCount;
	};
}
