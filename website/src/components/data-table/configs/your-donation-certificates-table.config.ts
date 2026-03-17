import { makeYourCertificatesColumns } from '@/components/data-table/columns/your-donation-certificates';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { YourDonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';

export const getYourDonationCertificatesTableConfig = ({
	title,
	emptyMessage,
}: {
	title: string;
	emptyMessage: string;
}): DataTableConfig<YourDonationCertificateTableViewRow> => ({
	id: 'your-donation-certificates',
	title,
	emptyMessage,
	searchKeys: [],
	sortOptions: [
		{ id: 'createdAt', label: 'Created' },
		{ id: 'year', label: 'Year' },
		{ id: 'language', label: 'Language' },
	],
	makeColumns: makeYourCertificatesColumns,
	showColumnVisibilitySelector: true,
	showEntityIdColumn: false,
});
