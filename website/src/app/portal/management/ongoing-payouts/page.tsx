import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import type { TableFilterConfig } from '@/components/data-table/table-config.types';
import { getPaginatedOngoingPayoutTableView } from '@/modules/payouts/payout.service';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { OngoingPayoutsTable } from './ongoing-payouts-table';

export default function OngoingPayoutsPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<OngoingPayoutsDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const OngoingPayoutsDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const t = await getTranslations('portal-management');
	const user = await requireSession('user');
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedOngoingPayoutTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const programFilterOptions = result.success ? result.data.programFilterOptions : [];
	const toolbarFilters: TableFilterConfig[] = [
		{
			id: 'program',
			queryKey: 'programId',
			label: t('filters.program.label'),
			placeholder: t('filters.program.all'),
			value: tableQuery.programId,
			options: programFilterOptions.map((program) => ({ value: program.id, label: program.name })),
		},
	];

	return (
		<OngoingPayoutsTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} toolbarFilters={toolbarFilters} />
	);
};
