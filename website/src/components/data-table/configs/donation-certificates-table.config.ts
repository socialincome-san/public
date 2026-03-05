import { makeDonationCertificateColumns } from '@/components/data-table/columns/donation-certificates';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { DonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';

export const donationCertificatesTableConfig: DataTableConfig<DonationCertificateTableViewRow> = {
	id: 'donation-certificates',
	title: 'Donation Certificates',
	emptyMessage: 'No donation certificates found',
	searchKeys: ['contributorFirstName', 'contributorLastName', 'email', 'storagePath', 'year'],
	sortOptions: [
		{ id: 'year', label: 'Year' },
		{ id: 'contributor', label: 'Contributor' },
		{ id: 'email', label: 'Email' },
		{ id: 'storagePath', label: 'Storage path' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeDonationCertificateColumns,
	showColumnVisibilitySelector: true,
};
