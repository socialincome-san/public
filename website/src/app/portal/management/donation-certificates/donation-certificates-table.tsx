'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	donationCertificatesTableConfig,
	getDonationCertificatesTableFilters,
} from '@/components/data-table/configs/donation-certificates-table.config';
import { TableQueryState } from '@/components/data-table/query-state';
import type { DonationCertificateTableViewRow } from '@/modules/donation-certificates/donation-certificate.types';
import { FileTextIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { translateManagementFilters, translateManagementTableConfig } from '../management-table-config';
import GenerateDonationCertificatesDialog from './generate-donation-certificates-dialog';

export const DonationCertificateTable = ({
	rows,
	error,
	query,
	contributorFilterOptions,
}: {
	rows: DonationCertificateTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
	contributorFilterOptions: { id: string; name: string }[];
}) => {
	const t = useTranslations('portal-management');
	const [open, setOpen] = useState<boolean>(false);
	const config = translateManagementTableConfig(donationCertificatesTableConfig, {
		title: t('tables.donationCertificates.title'),
		emptyMessage: t('tables.donationCertificates.empty'),
		columns: {
			year: t('columns.year'),
			contributor: t('columns.contributor'),
			email: t('columns.email'),
			storagePath: t('columns.storagePath'),
			createdAt: t('columns.createdAt'),
		},
	});
	const filters = translateManagementFilters(getDonationCertificatesTableFilters({ query, contributorFilterOptions }), {
		contributor: { label: t('filters.contributor.label'), placeholder: t('filters.contributor.all') },
	});

	return (
		<>
			<GenerateDonationCertificatesDialog open={open} setOpen={setOpen} />
			<ConfiguredDataTableClient
				config={config}
				titleInfoTooltip={t('tables.donationCertificates.tooltip')}
				rows={rows}
				error={error}
				query={query}
				toolbarFilters={filters}
				actionMenuItems={[
					{
						label: t('actions.generateDonationCertificates'),
						icon: <FileTextIcon />,
						onSelect: () => setOpen(true),
					},
				]}
			/>
		</>
	);
};
