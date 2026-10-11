import { makeYourCertificatesColumns } from '@/components/data-table/columns/your-donation-certificates';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { YourDonationCertificateTableViewRow } from '@/modules/donation-certificates/donation-certificate.types';
import type { ReactNode } from 'react';

export const getYourDonationCertificatesTableConfig = ({
	title,
	emptyMessage,
}: {
	title: string;
	emptyMessage: ReactNode;
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
