import { DefaultParams } from '@/app/[lang]/[region]';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { resolveWebsiteLanguage } from '@/lib/i18n/utils';
import { getPaginatedContributorDonationCertificates } from '@/modules/donation-certificates/donation-certificate.service';
import type { YourDonationCertificateTableViewRow } from '@/modules/donation-certificates/donation-certificate.types';
import { YourDonationCertificateTable } from './your-donation-certificate-table-client';

export default async function YourDonationCertificates({
	lang,
	searchParams,
}: DefaultParams & { searchParams: Promise<Record<string, string>> }) {
	const contributor = await getAuthenticatedContributorOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedContributorDonationCertificates(contributor.id, tableQuery);
	const error = result.success ? null : result.error;
	const rows: YourDonationCertificateTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return (
		<YourDonationCertificateTable
			rows={rows}
			error={error}
			lang={resolveWebsiteLanguage({ pathnameLanguage: lang })}
			query={{ ...tableQuery, totalRows }}
		/>
	);
}
