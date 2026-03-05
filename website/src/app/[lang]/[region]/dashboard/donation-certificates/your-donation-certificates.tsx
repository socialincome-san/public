import { DefaultParams } from '@/app/[lang]/[region]';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { DonationCertificateReadService } from '@/lib/services/donation-certificate/donation-certificate-read.service';
import { YourDonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import { YourDonationCertificateTable } from './your-donation-certificate-table-client';

export default async function YourDonationCertificates({
	lang,
	searchParams,
}: DefaultParams & { searchParams: Promise<Record<string, string>> }) {
	const contributor = await getAuthenticatedContributorOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const service = new DonationCertificateReadService();
	const result = await service.getPaginatedYourCertificatesTableView(contributor.id, tableQuery);
	const error = result.success ? null : result.error;
	const rows: YourDonationCertificateTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	return (
		<YourDonationCertificateTable
			rows={rows}
			error={error}
			lang={lang as WebsiteLanguage}
			query={{ ...tableQuery, totalRows }}
		/>
	);
}
