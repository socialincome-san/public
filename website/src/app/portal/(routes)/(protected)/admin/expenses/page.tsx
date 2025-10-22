import { Button } from '@/app/portal/components/button';
import { makeExpenseColumns } from '@/app/portal/components/data-table/columns/expenses';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { ExpenseService } from '@socialincome/shared/src/database/services/expense/expense.service';
import type { ExpenseTableViewRow } from '@socialincome/shared/src/database/services/expense/expense.types';

export default async function ExpensesPage() {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const service = new ExpenseService();
	const result = await service.getExpenseAdminTableView(user);

	const error = result.success ? null : result.error;
	const rows: ExpenseTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="All Expenses"
			error={error}
			emptyMessage="No expenses found"
			data={rows}
			makeColumns={makeExpenseColumns}
			actions={<Button>Add expense</Button>}
		/>
	);
}
