import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import { services } from '@/lib/services/services';

import { YourDonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import { YourDonationCertificateTable } from './your-donation-certificate-table-client';

export default async function YourDonationCertificates({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
	const { lang } = await getWebsiteRootParams();
	const contributor = await getAuthenticatedContributorOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await services.read.donationCertificate.getPaginatedYourCertificatesTableView(contributor.id, tableQuery);
	const error = result.success ? null : result.error;
	const rows: YourDonationCertificateTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <YourDonationCertificateTable rows={rows} error={error} lang={lang} query={{ ...tableQuery, totalRows }} />;
}
