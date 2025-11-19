import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { ExpenseService } from '@socialincome/shared/src/database/services/expense/expense.service';
import type { ExpenseTableViewRow } from '@socialincome/shared/src/database/services/expense/expense.types';
import ExpensesTable from './expenses-table';

export default async function ExpensesPage() {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const service = new ExpenseService();
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: ExpenseTableViewRow[] = result.success ? result.data.tableRows : [];

	return <ExpensesTable rows={rows} error={error} />;
}
