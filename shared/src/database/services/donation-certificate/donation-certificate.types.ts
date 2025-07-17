import { DonationCertificate as PrismaDonationCertificate } from '@prisma/client';

export type CreateDonationCertificateInput = Omit<PrismaDonationCertificate, 'id' | 'createdAt' | 'updatedAt'>;
