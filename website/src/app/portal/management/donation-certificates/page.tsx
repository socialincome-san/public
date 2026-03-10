import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { DonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import { services } from '@/lib/services/services';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';
import { DonationCertificateTable } from './donation-certificates-table';

export default function DonationCertificatesPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<DonationCertificatesDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const DonationCertificatesDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const certificatesResult = await services.read.donationCertificate.getPaginatedTableView(user.id, tableQuery);

	const error = certificatesResult.success ? null : certificatesResult.error;
	const certificateRows: DonationCertificateTableViewRow[] = certificatesResult.success
		? certificatesResult.data.tableRows
		: [];
	const totalRows = certificatesResult.success ? certificatesResult.data.totalCount : 0;

	return <DonationCertificateTable error={error} rows={certificateRows} query={{ ...tableQuery, totalRows }} />;
};
