import { AdditionalFieldDelegate, buildCollection, buildProperties } from '@camberi/firecms';
import { DonationCertificate, DONATION_CERTIFICATE_FIRESTORE_PATH } from '@socialincome/shared/src/types';

const DownloadLinkColumn: AdditionalFieldDelegate<DonationCertificate> = {
	id: 'download_link',
	name: 'Download Link',
	builder: ({ entity }) => {
		return (
			<a href={entity.values.url} target="_blank" rel="noreferrer">
				Download
			</a>
		);
	},
	dependencies: ['url'],
};

export const donationCertificateCollection = buildCollection<DonationCertificate>({
	name: 'Donation Certificates',
	group: 'Finances',
	path: DONATION_CERTIFICATE_FIRESTORE_PATH,
	textSearchEnabled: false,
	customId: true,
	additionalColumns: [DownloadLinkColumn],
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
