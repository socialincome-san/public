'use client';

import { makeDonationCertificateColumns } from '@/components/data-table/columns/donation-certificates';
import DataTable from '@/components/data-table/data-table';
import { DonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import { FileTextIcon } from 'lucide-react';
import { useState } from 'react';
import GenerateDonationCertificatesDialog from './generate-donation-certificates-dialog';

export const DonationCertificateTable = ({
	rows,
	error,
}: {
	rows: DonationCertificateTableViewRow[];
	error: string | null;
}) => {
	const [open, setOpen] = useState<boolean>(false);
	return (
		<>
			<GenerateDonationCertificatesDialog open={open} setOpen={setOpen} />
			<DataTable
				title="Donation Certificates"
				error={error}
				emptyMessage="No donation certificates found"
				data={rows}
				makeColumns={makeDonationCertificateColumns}
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
