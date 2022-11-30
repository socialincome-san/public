import { buildCollection, buildProperties } from '@camberi/firecms';
import { DONATION_CERTIFICATE_FIRESTORE_PATH, DonationCertificate } from '@socialincome/shared/src/types';

export const donationCertificateCollection = buildCollection<DonationCertificate>({
	name: 'Donation Certificates',
	group: 'Finances',
	path: DONATION_CERTIFICATE_FIRESTORE_PATH,
	textSearchEnabled: false,
	customId: true,
	permissions: ({ authController }) => ({
		edit: true,
		create: true,
		delete: true,
	}),
	properties: buildProperties<DonationCertificate>({
		url: {
			dataType: 'string',
			name: 'Document Link',
			disabled: true,
			markdown: true,
		},
		country: {
			dataType: 'string',
			name: 'Created for country',
			disabled: true,
		},
		year: {
			dataType: 'string',
			name: 'Year',
			disabled: true,
		},
	}),
});
