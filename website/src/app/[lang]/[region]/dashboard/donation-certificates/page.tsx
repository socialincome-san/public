import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { DonationCertificateService } from '@/lib/services/donation-certificate/donation-certificate.service';
import { YourDonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import { YourDonationCertificateTable } from './your-donation-certificate-table-client';

export default async function Page({ params }: DefaultPageProps) {
	const contributor = await getAuthenticatedContributorOrRedirect();

	const service = new DonationCertificateService();
	const result = await service.getYourCertificatesTableView(contributor.id);

	const error = result.success ? null : result.error;
	const rows: YourDonationCertificateTableViewRow[] = result.success ? result.data.tableRows : [];
	return (
		<Suspense fallback={<div>Loading donation certificates…</div>}>
			<YourDonationCertificateTable rows={rows} error={error} />
		</Suspense>
	);
}
