import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
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

	const service = services.donationCertificate;
	const certificatesResult = await service.getTableView(user.id);

	const error = certificatesResult.success ? null : certificatesResult.error;
	const certificateRows: DonationCertificateTableViewRow[] = certificatesResult.success
		? certificatesResult.data.tableRows
		: [];

	return <DonationCertificateTable error={error} rows={certificateRows} />;
};
