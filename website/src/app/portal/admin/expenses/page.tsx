import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import type { ExpenseTableViewRow } from '@/lib/services/expense/expense.types';
import { services } from '@/lib/services/services';
import { Suspense } from 'react';
import ExpensesTable from './expenses-table';

export default function ExpensesPage() {
	return (
		<Suspense>
			<ExpensesDataLoader />
		</Suspense>
	);
}

const ExpensesDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const result = await services.expense.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: ExpenseTableViewRow[] = result.success ? result.data.tableRows : [];

	return <ExpensesTable rows={rows} error={error} />;
};
