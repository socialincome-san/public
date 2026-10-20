import type { SearchParamsPageProps } from '@/app/page-props';
import { getPortalOperationsTranslations } from '@/app/portal/portal-operations-server-translations';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { payoutForecastTableConfig } from '@/components/data-table/configs/payout-forecast-table.config';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedPayoutForecastTableView } from '@/modules/payouts/payout.service';
import { PAYOUT_FORECAST_MONTHS_AHEAD } from '@/modules/payouts/payout.types';
import { requireSession } from '@/server/session';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { Suspense } from 'react';

type Props = SearchParamsPageProps & { params: Promise<{ programId: string }> };

export default function FinancesPageProgramScoped({ params, searchParams }: Props) {
	return (
		<BlockWrapper marginTop="none" marginBottom="none">
			<Card>
				<Suspense fallback={<AppLoadingSkeleton />}>
					<FinancesProgramScopedDataLoader params={params} searchParams={searchParams} />
				</Suspense>
			</Card>
		</BlockWrapper>
	);
}

const FinancesProgramScopedDataLoader = async ({ params, searchParams }: Props) => {
	const { programId } = await params;
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);
	const user = await requireSession('user');
	const t = await getPortalOperationsTranslations();

	const result = await getPaginatedPayoutForecastTableView(user.id, programId, PAYOUT_FORECAST_MONTHS_AHEAD, tableQuery);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return (
		<ConfiguredDataTableClient
			config={payoutForecastTableConfig}
			titleInfoTooltip={t('program.payout_forecast_info')}
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
		/>
	);
};
