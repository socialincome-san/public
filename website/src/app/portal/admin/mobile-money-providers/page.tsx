import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { getServices } from '@/lib/services/services';
import type { MobileMoneyProviderTableViewRow } from '@/lib/services/mobile-money-provider/mobile-money-provider.types';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';
import MobileMoneyProvidersTable from './mobile-money-providers-table';

export default function MobileMoneyProvidersPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<MobileMoneyProvidersDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const MobileMoneyProvidersDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	
	const result = await getServices().mobileMoneyProviderRead.getPaginatedTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: MobileMoneyProviderTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <MobileMoneyProvidersTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
