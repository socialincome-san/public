import { DefaultParams } from '@/app/[lang]/[region]';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { YourDonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import { services } from '@/lib/services/services';
import { YourDonationCertificateTable } from './your-donation-certificate-table-client';

export default async function YourDonationCertificates({ lang }: DefaultParams) {
	const contributor = await getAuthenticatedContributorOrRedirect();

	const result = await services.donationCertificate.getYourCertificatesTableView(contributor.id);
	const error = result.success ? null : result.error;
	const rows: YourDonationCertificateTableViewRow[] = result.success ? result.data.tableRows : [];
	return <YourDonationCertificateTable rows={rows} error={error} lang={lang as WebsiteLanguage} />;
}
