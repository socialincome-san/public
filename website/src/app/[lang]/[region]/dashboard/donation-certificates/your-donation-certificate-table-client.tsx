'use client';

import { Button } from '@/components/button';
import { makeYourCertificatesColumns } from '@/components/data-table/columns/your-donation-certificates';
import DataTable from '@/components/data-table/data-table';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { YourDonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import { useState } from 'react';
import GenerateDonationCertificateDialog from './generate-donation-certificate-dialog';

export function YourDonationCertificateTable({
	rows,
	error,
	lang,
}: {
	rows: YourDonationCertificateTableViewRow[];
	error: string | null;
	lang: WebsiteLanguage;
}) {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<>
			<GenerateDonationCertificateDialog open={open} setOpen={setOpen} lang={lang} />
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
