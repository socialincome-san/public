import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedCandidateTableViewForOperator } from '@/modules/candidates/candidate.service';
import type { CandidatesTableViewRow } from '@/modules/candidates/candidate.types';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';
import { CandidatesTableClient } from '../../admin/candidates/candidates-table-client';

export default function ManagementPoolPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<ManagementPoolDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const ManagementPoolDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await requireSession('user');
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedCandidateTableViewForOperator(user.id, tableQuery);
	const error = result.success ? null : result.error;
	const rows: CandidatesTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return (
		<CandidatesTableClient
			rows={rows}
			error={error}
			readOnly
			showCsvDownload={false}
			query={{ ...tableQuery, totalRows }}
			countryFilterOptions={result.success ? result.data.countryFilterOptions : []}
			genderFilterOptions={result.success ? result.data.genderFilterOptions : []}
			localPartnerFilterOptions={result.success ? result.data.localPartnerFilterOptions : []}
			showGenderFilter
		/>
	);
};
