'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { expensesTableConfig } from '@/components/data-table/configs/expenses-table.config';
import { useSearchParamState } from '@/components/data-table/hooks/use-search-param-state';
import type { TableQueryState } from '@/components/data-table/query-state';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import type { ExpenseTableViewRow } from '@/modules/expenses/expense.types';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import ExpensesForm from './expenses-form';

export default function ExpensesTable({
	rows,
	error,
	query,
}: {
	rows: ExpenseTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) {
	const [expenseId, setExpenseId] = useSearchParamState('expenseId');
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const open = isCreateFormOpen || Boolean(expenseId);

	const openEmptyForm = () => {
		setExpenseId(undefined);
		setErrorMessage(null);
		setIsCreateFormOpen(true);
	};

	const openEditForm = (row: ExpenseTableViewRow) => {
		setExpenseId(row.id);
		setErrorMessage(null);
	};

	const onOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setExpenseId(undefined);
			setIsCreateFormOpen(false);
		}
	};

	const onError = (error: unknown) => {
		const errorMessage = retrieveErrorMessage(error);
		setErrorMessage(`Error saving expense: ${errorMessage}`);
		console.error('Expense Form Error', { error });
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={expensesTableConfig}
				titleInfoTooltip="Shows expense records across organizations in admin scope."
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: 'Add expense',
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
			/>

			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{expenseId ? 'Edit' : 'Add'} expense</DialogTitle>
					</DialogHeader>
					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{errorMessage}</AlertDescription>
						</Alert>
					)}
					<ExpensesForm
						expenseId={expenseId}
						onSuccess={() => onOpenChange(false)}
						onCancel={() => onOpenChange(false)}
						onError={onError}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
