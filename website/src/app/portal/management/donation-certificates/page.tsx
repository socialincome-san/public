import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { DonationCertificateService } from '@/lib/services/donation-certificate/donation-certificate.service';
import type { DonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import { Suspense } from 'react';
import { DonationCertificateTable } from './donation-certificates-table';

export default function DonationCertificatesPage() {
	return (
		<Suspense>
			<DonationCertificatesDataLoader />
		</Suspense>
	);
}

const DonationCertificatesDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new DonationCertificateService();
	const certificatesResult = await service.getTableView(user.id);

	const error = certificatesResult.success ? null : certificatesResult.error;
	const certificateRows: DonationCertificateTableViewRow[] = certificatesResult.success
		? certificatesResult.data.tableRows
		: [];

	return <DonationCertificateTable error={error} rows={certificateRows} />;
};
