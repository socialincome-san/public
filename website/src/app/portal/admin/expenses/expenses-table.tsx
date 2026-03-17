'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { expensesTableConfig } from '@/components/data-table/configs/expenses-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import type { ExpenseTableViewRow } from '@/lib/services/expense/expense.types';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { logger } from '@/lib/utils/logger';
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
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [expenseId, setExpenseId] = useState<string | undefined>(undefined);

	const openEmptyForm = () => {
		setExpenseId(undefined);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: ExpenseTableViewRow) => {
		setExpenseId(row.id);
		setErrorMessage(null);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		const errorMessage = retrieveErrorMessage(error);
		setErrorMessage(`Error saving expense: ${errorMessage}`);
		logger.error('Expense Form Error', { error });
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

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{expenseId ? 'Edit' : 'Add'} expense</DialogTitle>
					</DialogHeader>
					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription className="max-w-full overflow-auto">{errorMessage}</AlertDescription>
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
