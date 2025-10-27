import { Button } from '@/app/portal/components/button';
import { makeDonationCertificateColumns } from '@/app/portal/components/data-table/columns/donation-certificates';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { DonationCertificateService } from '@socialincome/shared/src/database/services/donation-certificate/donation-certificate.service';
import type { DonationCertificateTableViewRow } from '@socialincome/shared/src/database/services/donation-certificate/donation-certificate.types';

export default async function DonationCertificatesPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new DonationCertificateService();
	const certificatesResult = await service.getTableView(user.id);

	const error = certificatesResult.success ? null : certificatesResult.error;
	const certificateRows: DonationCertificateTableViewRow[] = certificatesResult.success
		? certificatesResult.data.tableRows
		: [];

	return (
		<DataTable
			title="Donation Certificates"
			error={error}
			emptyMessage="No donation certificates found"
			data={certificateRows}
			makeColumns={makeDonationCertificateColumns}
			actions={<Button>Upload new certificate</Button>}
		/>
	);
}
