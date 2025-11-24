import { DefaultParams } from '@/app/[lang]/[region]';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { DonationCertificateService } from '@/lib/services/donation-certificate/donation-certificate.service';
import { YourDonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import { YourDonationCertificateTable } from './your-donation-certificate-table-client';

export default async function YourDonationCertificates({ lang }: DefaultParams) {
	const contributor = await getAuthenticatedContributorOrRedirect();

	const service = new DonationCertificateService();
	const result = await service.getYourCertificatesTableView(contributor.id);
	const error = result.success ? null : result.error;
	const rows: YourDonationCertificateTableViewRow[] = result.success ? result.data.tableRows : [];
	return <YourDonationCertificateTable rows={rows} error={error} lang={lang} />;
}
