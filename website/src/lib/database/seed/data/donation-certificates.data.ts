import { DonationCertificate } from '@/generated/prisma/client';

export const donationCertificatesData: DonationCertificate[] = [
	{
		id: 'donation-certificate-1',
		legacyFirestoreId: null,
		contributorId: 'contributor-1',
		year: 2024,
		storagePath: '/certificates/contributor-1-2024.pdf',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: new Date(),
		language: 'de',
	},
	{
		id: 'donation-certificate-2',
		legacyFirestoreId: null,
		contributorId: 'contributor-2',
		year: 2024,
		storagePath: '/certificates/contributor-2-2024.pdf',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: new Date(),
		language: 'de',
	},
	{
		id: 'donation-certificate-3',
		legacyFirestoreId: null,
		contributorId: 'contributor-3',
		year: 2024,
		storagePath: '/certificates/contributor-3-2024.pdf',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: new Date(),
		language: 'de',
	}
];