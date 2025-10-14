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
		return input.map(({ certificate, user }) => ({
			legacyFirestoreId: `${user.id}_${certificate.id}`,
			year: certificate.year,
			storagePath: certificate.storage_path ?? (certificate as any).url ?? '',
			contributor: {
				connect: { legacyFirestoreId: user.id },
			},
		}));
	};
}
