import { Prisma } from '@prisma/client';
import { BaseTransformer } from '../core/base.transformer';
import { FirestoreDonationCertificateWithUser } from './donation-certificate.types';

export class DonationCertificateTransformer extends BaseTransformer<
	FirestoreDonationCertificateWithUser,
	Prisma.DonationCertificateCreateInput
> {
	transform = async (
		input: FirestoreDonationCertificateWithUser[],
	): Promise<Prisma.DonationCertificateCreateInput[]> => {
		const transformed: Prisma.DonationCertificateCreateInput[] = [];
		let skipped = 0;

		for (const { certificate, user } of input) {
			if (user.test_user) {
				skipped++;
				continue;
			}

			transformed.push({
				legacyFirestoreId: `${user.id}_${certificate.id}`,
				year: certificate.year,
				language: user.language,
				storagePath: certificate.storage_path ?? (certificate as any).url ?? '',
				contributor: {
					connect: { legacyFirestoreId: user.id },
				},
			});
		}

		if (skipped > 0) console.log(`⚠️ Skipped ${skipped} test donation certificates`);

		return transformed;
	};
}
