import { PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';
import { LocalPartnerCreateInput } from './local-partner.types';

const prisma = new PrismaClient();

export class LocalPartnerImporter extends BaseImporter<LocalPartnerCreateInput> {
	import = async (partners: LocalPartnerCreateInput[]): Promise<number> => {
		let createdCount = 0;

		for (const data of partners) {
			await prisma.localPartner.create({ data });
			createdCount++;
		}

		return createdCount;
	};
}
