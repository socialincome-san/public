import { Card } from '@/components/card';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { payoutForecastTableConfig } from '@/components/data-table/configs/payout-forecast-table.config';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';

type Props = SearchParamsPageProps & { params: Promise<{ programId: string }> };
const MONTHS_AHEAD = 6;

export default function FinancesPageProgramScoped({ params, searchParams }: Props) {
	return (
		<Card>
			<Suspense fallback={<AppLoadingSkeleton />}>
				<FinancesProgramScopedDataLoader params={params} searchParams={searchParams} />
			</Suspense>
		</Card>
	);
}

const FinancesProgramScopedDataLoader = async ({ params, searchParams }: Props) => {
	const { programId } = await params;
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);
	const user = await getAuthenticatedUserOrRedirect();

	const result = await services.read.payout.getPaginatedForecastTableView(user.id, programId, MONTHS_AHEAD, tableQuery);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return (
		<ConfiguredDataTableClient
			config={payoutForecastTableConfig}
			titleInfoTooltip="Forecast is calculated from currently eligible recipients, remaining payout duration, and latest exchange rates."
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
		/>
	);
};
