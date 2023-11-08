import {
	DONATION_CERTIFICATE_FIRESTORE_PATH,
	DonationCertificate,
} from '@socialincome/shared/src/types/donation-certificate';
import { AdditionalFieldDelegate, buildProperties } from 'firecms';
import { buildAuditedCollection } from './shared';

const DownloadLinkColumn: AdditionalFieldDelegate<DonationCertificate> = {
	id: 'download_link',
	name: 'Download Link',
	Builder: ({ entity }) => {
		return (
			<a href={entity.values.url} target="_blank" rel="noreferrer">
				Download
			</a>
		);
	},
	dependencies: ['url'],
};

export const donationCertificateCollection = buildAuditedCollection<DonationCertificate>({
	name: 'Donation Certificates',
	group: 'Finances',
	path: DONATION_CERTIFICATE_FIRESTORE_PATH,
	textSearchEnabled: false,
	initialSort: ['year', 'desc'],
	customId: true,
	additionalFields: [DownloadLinkColumn],

	permissions: {
		edit: true,
		create: true,
		delete: true,
	},
	properties: buildProperties<DonationCertificate>({
		url: {
			dataType: 'string',
			name: 'URL',
			disabled: {
				hidden: true,
			},
		},
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
	}),
});
