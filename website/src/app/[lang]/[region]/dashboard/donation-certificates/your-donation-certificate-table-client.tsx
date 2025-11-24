'use client';

import { Button } from '@/components/button';
import { makeYourCertificatesColumns } from '@/components/data-table/columns/your-donation-certificates';
import DataTable from '@/components/data-table/data-table';
import { useStorage } from '@/lib/firebase/hooks/useStorage';
import { YourDonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import { useState } from 'react';
import GenerateDonationCertificateDialog from './generate-donation-certificate-dialog';

export function YourDonationCertificateTable({
	rows,
	error,
}: {
	rows: YourDonationCertificateTableViewRow[];
	error: string | null;
}) {
	const [open, setOpen] = useState<boolean>(false);
	const storage = useStorage();

	return (
		<>
			<GenerateDonationCertificateDialog open={open} setOpen={setOpen} />
			<DataTable
				title="Your Donation Certificates"
				error={error}
				emptyMessage="No certificates found"
				data={rows}
				actions={<Button onClick={() => setOpen(true)}>Generate Certificate</Button>}
				makeColumns={makeYourCertificatesColumns}
			/>
		</>
	);
}
