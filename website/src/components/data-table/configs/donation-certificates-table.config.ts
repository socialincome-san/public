import { makeDonationCertificateColumns } from '@/components/data-table/columns/donation-certificates';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { DonationCertificateTableViewRow } from '@/modules/donation-certificates/donation-certificate.types';
import { linkedRecordFilter } from './linked-record-filter';

type DonationCertificateFiltersArgs = {
	query?: TableQueryState & { totalRows: number };
	contributorFilterOptions: { id: string; name: string }[];
};

export const donationCertificatesTableConfig: DataTableConfig<DonationCertificateTableViewRow> = {
	id: 'donation-certificates',
	title: 'Donation Certificates',
	emptyMessage: 'No donation certificates found',
	searchKeys: ['id', 'contributorFirstName', 'contributorLastName', 'email', 'year'],
	sortOptions: [
		{ id: 'year', label: 'Year' },
		{ id: 'contributor', label: 'Contributor' },
		{ id: 'email', label: 'Email' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: () => makeDonationCertificateColumns(),
	showColumnVisibilitySelector: true,
};

export const contributorDonationCertificatesTableConfig: DataTableConfig<DonationCertificateTableViewRow> = {
	...donationCertificatesTableConfig,
	id: 'contributor-donation-certificates',
	searchKeys: ['id', 'year'],
	sortOptions: donationCertificatesTableConfig.sortOptions?.filter(({ id }) => id !== 'contributor' && id !== 'email'),
	makeColumns: () => makeDonationCertificateColumns({ hideContributor: true }),
};

export const getDonationCertificatesTableFilters = ({
	query,
	contributorFilterOptions,
}: DonationCertificateFiltersArgs): TableFilterConfig[] => {
	if (!query) {
		return [];
	}

	return linkedRecordFilter({
		id: 'contributor',
		queryKey: 'contributorId',
		label: 'Contributor',
		placeholder: 'All contributors',
		value: query.contributorId,
		options: contributorFilterOptions.map((contributor) => ({ value: contributor.id, label: contributor.name })),
	});
};
