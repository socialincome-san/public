import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { getPaginatedCandidateTableView } from '@/modules/candidates/candidate.service';
import type { CandidatesTableViewRow } from '@/modules/candidates/candidate.types';
import { Suspense } from 'react';
import { CandidatesTableClient } from './candidates-table-client';

export default function CandidatesPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<CandidatesDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const CandidatesDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	requireAdmin(user);
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedCandidateTableView(user.id, tableQuery);
	const error = result.success ? null : result.error;
	const rows: CandidatesTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const countryFilterOptions = result.success ? result.data.countryFilterOptions : [];
	const genderFilterOptions = result.success ? result.data.genderFilterOptions : [];
	const localPartnerFilterOptions = result.success ? result.data.localPartnerFilterOptions : [];

	return (
		<CandidatesTableClient
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			countryFilterOptions={countryFilterOptions}
			genderFilterOptions={genderFilterOptions}
			localPartnerFilterOptions={localPartnerFilterOptions}
			showGenderFilter
		/>
	);
};
