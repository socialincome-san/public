import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedDonationCertificates } from '@/modules/donation-certificates/donation-certificate.service';
import type { DonationCertificateTableViewRow } from '@/modules/donation-certificates/donation-certificate.types';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
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
	const user = await requireSession('user');
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const certificatesResult = await getPaginatedDonationCertificates(user.id, tableQuery);

	const error = certificatesResult.success ? null : certificatesResult.error;
	const certificateRows: DonationCertificateTableViewRow[] = certificatesResult.success
		? certificatesResult.data.tableRows
		: [];
	const totalRows = certificatesResult.success ? certificatesResult.data.totalCount : 0;

	return <DonationCertificateTable error={error} rows={certificateRows} query={{ ...tableQuery, totalRows }} />;
};
