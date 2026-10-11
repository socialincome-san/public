import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedExpenseTableView } from '@/modules/expenses/expense.service';
import type { ExpenseTableViewRow } from '@/modules/expenses/expense.types';
import { requireAdmin } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';
import ExpensesTable from './expenses-table';

export default function ExpensesPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<ExpensesDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const ExpensesDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await requireAdmin();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedExpenseTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: ExpenseTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <ExpensesTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
