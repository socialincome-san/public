import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { CandidateReadService } from '@/lib/services/candidate/candidate-read.service';
import { CandidatesTableViewRow } from '@/lib/services/candidate/candidate.types';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
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
	await requireAdmin(user);
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const candidateService = new CandidateReadService();
	const result = await candidateService.getPaginatedTableView(user.id, tableQuery);
	const error = result.success ? null : result.error;
	const rows: CandidatesTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const countryFilterOptions = result.success ? result.data.countryFilterOptions : [];
	const localPartnerFilterOptions = result.success ? result.data.localPartnerFilterOptions : [];

	return (
		<CandidatesTableClient
			rows={rows}
			error={error}
			readOnly={false}
			query={{ ...tableQuery, totalRows }}
			countryFilterOptions={countryFilterOptions}
			localPartnerFilterOptions={localPartnerFilterOptions}
		/>
	);
};
