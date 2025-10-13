import { Prisma, PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';

const prisma = new PrismaClient();

export class DonationCertificateImporter extends BaseImporter<Prisma.DonationCertificateCreateInput> {
	import = async (certificates: Prisma.DonationCertificateCreateInput[]): Promise<number> => {
		let createdCount = 0;

		for (const certificate of certificates) {
			try {
				const contributorLegacyId =
					'contributor' in certificate
						? (certificate.contributor as { connect: { legacyFirestoreId: string } }).connect.legacyFirestoreId
						: undefined;

				if (contributorLegacyId) {
					const exists = await prisma.contributor.findUnique({
						where: { legacyFirestoreId: contributorLegacyId },
					});
					if (!exists) continue;
				}

				await prisma.donationCertificate.create({ data: certificate });
				createdCount++;
			} catch (error) {
				const id = (certificate.legacyFirestoreId as string) ?? 'unknown';
				const message = error instanceof Error ? error.message : 'Unknown error';
				console.error(`[DonationCertificateImporter] Failed to import ${id}: ${message}`);
			}
		}

		return createdCount;
	};
}
