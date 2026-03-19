import { DonationCertificate } from '@/generated/prisma/client';

export const donationCertificatesData: DonationCertificate[] = [
	{
		id: 'donation-certificate-core-high-2024',
		legacyFirestoreId: null,
		contributorId: 'contributor-core-high',
		year: 2024,
		storagePath: '/certificates/contributor-core-high-2024.pdf',
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
		language: 'de',
	},
	{
		id: 'donation-certificate-core-recurring-2024',
		legacyFirestoreId: null,
		contributorId: 'contributor-core-recurring',
		year: 2024,
		storagePath: '/certificates/contributor-core-recurring-2024.pdf',
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
		language: 'en',
	},
	{
		id: 'donation-certificate-lr-high-2024',
		legacyFirestoreId: null,
		contributorId: 'contributor-lr-high',
		year: 2024,
		storagePath: '/certificates/contributor-lr-high-2024.pdf',
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
		language: 'en',
	},
];
