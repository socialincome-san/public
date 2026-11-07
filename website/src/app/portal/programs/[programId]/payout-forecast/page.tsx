import type { SearchParamsPageProps } from '@/app/page-props';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { payoutForecastTableConfig } from '@/components/data-table/configs/payout-forecast-table.config';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedPayoutForecastTableView } from '@/modules/payouts/payout.service';
import { PAYOUT_FORECAST_MONTHS_AHEAD } from '@/modules/payouts/payout.types';
import { getProgramDashboardStats } from '@/modules/programs/program-stats.service';
import { requireSession } from '@/server/session';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { ProgramFinanceSummaryCards } from './program-finance-summary-cards';

type Props = SearchParamsPageProps & { params: Promise<{ programId: string }> };

export default function FinancesPageProgramScoped({ params, searchParams }: Props) {
	return (
		<BlockWrapper marginTop="none" marginBottom="none">
			<Suspense fallback={<AppLoadingSkeleton />}>
				<FinancesProgramScopedDataLoader params={params} searchParams={searchParams} />
			</Suspense>
		</BlockWrapper>
	);
}

const FinancesProgramScopedDataLoader = async ({ params, searchParams }: Props) => {
	const { programId } = await params;
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);
	const user = await requireSession('user');
	const t = await getTranslations('website-common');

	const [result, statsResult] = await Promise.all([
		getPaginatedPayoutForecastTableView(user.id, programId, PAYOUT_FORECAST_MONTHS_AHEAD, tableQuery),
		getProgramDashboardStats(programId),
	]);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return (
		<div className="space-y-6">
			{statsResult.success ? (
				<ProgramFinanceSummaryCards stats={statsResult.data} />
			) : (
				<p className="text-destructive text-sm">Could not load program finance summary: {statsResult.error}</p>
			)}

			<Card>
				<ConfiguredDataTableClient
					config={payoutForecastTableConfig}
					titleInfoTooltip={t('program-detail-page.payout-forecast-info')}
					rows={rows}
					error={error}
					query={{ ...tableQuery, totalRows }}
				/>
			</Card>
		</div>
	);
};
