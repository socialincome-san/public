import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { DonationCertificateService } from '@/lib/services/donation-certificate/donation-certificate.service';
import type { DonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import { DonationCertificateTable } from './donation-certificates-table';

export default async function DonationCertificatesPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new DonationCertificateService();
	const certificatesResult = await service.getTableView(user.id);

	const error = certificatesResult.success ? null : certificatesResult.error;
	const certificateRows: DonationCertificateTableViewRow[] = certificatesResult.success
		? certificatesResult.data.tableRows
		: [];

	return <DonationCertificateTable error={error} rows={certificateRows} />;
}
