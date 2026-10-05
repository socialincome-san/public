import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getPaginatedMobileMoneyProviderTableView } from '@/modules/mobile-money-providers/mobile-money-provider.service';
import type { MobileMoneyProviderTableViewRow } from '@/modules/mobile-money-providers/mobile-money-provider.types';
import { requireAdmin } from '@/server/session';
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
	const user = await requireAdmin();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedMobileMoneyProviderTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: MobileMoneyProviderTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <MobileMoneyProvidersTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
