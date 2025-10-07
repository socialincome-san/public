import { DonationCertificate } from '@prisma/client';

export const donationCertificatesData: DonationCertificate[] = [
	{
		id: 'donation-certificate-1',
		contributorId: 'contributor-1',
		year: 2024,
		storagePath: '/certificates/contributor-1-2024.pdf',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: 'donation-certificate-2',
		contributorId: 'contributor-2',
		year: 2024,
		storagePath: '/certificates/contributor-2-2024.pdf',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: 'donation-certificate-3',
		contributorId: 'contributor-3',
		year: 2024,
		storagePath: '/certificates/contributor-3-2024.pdf',
		createdAt: new Date(),
		updatedAt: new Date()
	}
];