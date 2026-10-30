import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getSucceededContributionYears } from '@/modules/contributions/contribution.service';
import { getPaginatedContributorDonationCertificates } from '@/modules/donation-certificates/donation-certificate.service';
import type { YourDonationCertificateTableViewRow } from '@/modules/donation-certificates/donation-certificate.types';
import { requireSession } from '@/server/session';
import { YourDonationCertificateTable } from './your-donation-certificate-table-client';

export default async function YourDonationCertificates({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
	const contributor = await requireSession('contributor');
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const [result, yearsResult] = await Promise.all([
		getPaginatedContributorDonationCertificates(contributor.id, tableQuery),
		getSucceededContributionYears(contributor.id),
	]);
	const error = result.success ? null : result.error;
	const rows: YourDonationCertificateTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const years = yearsResult.success ? yearsResult.data : [];

	return <YourDonationCertificateTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} years={years} />;
}
