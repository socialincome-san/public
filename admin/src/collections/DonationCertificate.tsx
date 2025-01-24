import {
	DONATION_CERTIFICATE_FIRESTORE_PATH,
	DonationCertificate,
} from '@socialincome/shared/src/types/donation-certificate';
import { buildProperties } from 'firecms';
import { buildAuditedCollection } from './shared';

export const donationCertificateCollection = buildAuditedCollection<DonationCertificate>({
	name: 'Donation Certificates',
	group: 'Finances',
	path: DONATION_CERTIFICATE_FIRESTORE_PATH,
	textSearchEnabled: false,
	initialSort: ['year', 'desc'],
	customId: true,

	permissions: {
		edit: true,
		create: true,
		delete: true,
	},
	properties: buildProperties<DonationCertificate>({
		country: {
			dataType: 'string',
			name: 'Created for country',
			disabled: true,
		},
		year: {
			dataType: 'number',
			name: 'Year',
			disabled: true,
		},
		storage_path: {
			dataType: 'string',
			name: 'Storage path',
			disabled: true,
		},
	}),
});
