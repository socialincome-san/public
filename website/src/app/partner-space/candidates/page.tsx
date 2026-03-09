import { CandidatesTableClient } from '@/app/portal/admin/candidates/candidates-table-client';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedLocalPartnerOrRedirect } from '@/lib/firebase/current-local-partner';
import { getServices } from '@/lib/services/services';
import { CandidatesTableViewRow } from '@/lib/services/candidate/candidate.types';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';

export default function CandidatesPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<CandidatesDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const CandidatesDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const partner = await getAuthenticatedLocalPartnerOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	
	const result = await getServices().candidateRead.getPaginatedTableViewByLocalPartner(partner.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: CandidatesTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const countryFilterOptions = result.success ? result.data.countryFilterOptions : [];
	const genderFilterOptions = result.success ? result.data.genderFilterOptions : [];

	return (
		<CandidatesTableClient
			rows={rows}
			error={error}
			readOnly={true}
			sessionType="local-partner"
			query={{ ...tableQuery, totalRows }}
			countryFilterOptions={countryFilterOptions}
			genderFilterOptions={genderFilterOptions}
			showGenderFilter
		/>
	);
};
