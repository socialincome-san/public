import { Prisma, PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';

const prisma = new PrismaClient();

export class DonationCertificateImporter extends BaseImporter<Prisma.DonationCertificateCreateInput> {
	import = async (certificates: Prisma.DonationCertificateCreateInput[]): Promise<number> => {
		let createdCount = 0;

		for (const certificate of certificates) {
			await prisma.donationCertificate.create({ data: certificate });
			createdCount++;
		}

		return createdCount;
	};
}
