import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import type { LocalPartnerTableViewRow } from '@/lib/services/local-partner/local-partner.types';
import { services } from '@/lib/services/services';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';
import LocalPartnersTable from './local-partners-table';

export default function LocalPartnersPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<LocalPartnersDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const LocalPartnersDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	requireAdmin(user);
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await services.read.localPartner.getPaginatedTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: LocalPartnerTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <LocalPartnersTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
