'use client';

import { Alert, AlertDescription, AlertTitle } from '@/app/portal/components/alert';
import { Button } from '@/app/portal/components/button';
import { makeExpenseColumns } from '@/app/portal/components/data-table/columns/expenses';
import DataTable from '@/app/portal/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import type { ExpenseTableViewRow } from '@socialincome/shared/src/database/services/expense/expense.types';
import { useState } from 'react';
import ExpensesForm from './expenses-form';

export default function ExpensesTable({ rows, error }: { rows: ExpenseTableViewRow[]; error: string | null }) {
	const [open, setOpen] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [expenseId, setExpenseId] = useState<string | undefined>(undefined);

	const openEmptyForm = () => {
		setExpenseId(undefined);
		setHasError(false);
		setOpen(true);
	};

	const openEditForm = (row: ExpenseTableViewRow) => {
		setExpenseId(row.id);
		setHasError(false);
		setOpen(true);
	};

	const onError = (e?: unknown) => {
		setHasError(true);
		console.error('Expense Form Error:', e);
	};

	return (
		<>
			<DataTable
				title="Expenses"
				error={error}
				emptyMessage="No expenses found"
				data={rows}
				makeColumns={makeExpenseColumns}
				actions={<Button onClick={openEmptyForm}>Add expense</Button>}
				onRowClick={openEditForm}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{expenseId ? 'Edit' : 'Add'} expense</DialogTitle>
					</DialogHeader>

					{hasError && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>Error saving expense</AlertDescription>
						</Alert>
					)}

					<ExpensesForm
						expenseId={expenseId}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
