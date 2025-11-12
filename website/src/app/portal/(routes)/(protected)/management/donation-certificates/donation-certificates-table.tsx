'use client';

import { Button } from '@/app/portal/components/button';
import { makeDonationCertificateColumns } from '@/app/portal/components/data-table/columns/donation-certificates';
import DataTable from '@/app/portal/components/data-table/data-table';
import { DonationCertificateTableViewRow } from '@socialincome/shared/src/database/services/donation-certificate/donation-certificate.types';
import { useState } from 'react';
import GenerateDonationCertificatesDialog from './generate-donation-certificates-dialog';

export function DonationCertificateTable({
	rows,
	error,
}: {
	rows: DonationCertificateTableViewRow[];
	error: string | null;
}) {
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
				actions={<Button onClick={() => setOpen(true)}>Generate Donation Certificates</Button>}
			/>
		</>
	);
}
