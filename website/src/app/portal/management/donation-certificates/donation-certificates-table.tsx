'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { donationCertificatesTableConfig } from '@/components/data-table/configs/donation-certificates-table.config';
import { TableQueryState } from '@/components/data-table/query-state';
import { DonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import { FileTextIcon } from 'lucide-react';
import { useState } from 'react';
import GenerateDonationCertificatesDialog from './generate-donation-certificates-dialog';

export const DonationCertificateTable = ({
	rows,
	error,
	query,
}: {
	rows: DonationCertificateTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) => {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<>
			<GenerateDonationCertificatesDialog open={open} setOpen={setOpen} />
			<ConfiguredDataTableClient
				config={donationCertificatesTableConfig}
				titleInfoTooltip="Shows donation certificates available for contributors in your active organization."
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: 'Generate Donation Certificates',
						icon: <FileTextIcon />,
						onSelect: () => setOpen(true),
					},
				]}
			/>
		</>
	);
};
