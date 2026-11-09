'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { RecordDialog } from '@/components/data-table/clients/record-dialog';
import { expensesTableConfig } from '@/components/data-table/configs/expenses-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import type { TableQueryState } from '@/components/data-table/query-state';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import type { ExpenseTableViewRow } from '@/modules/expenses/expense.types';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
	const t = useTranslations('portal-admin');
	const { recordId: expenseId, open, openCreate, openRecord, onOpenChange } = useRecordDialog('expenseId');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const openEmptyForm = () => {
		setErrorMessage(null);
		openCreate();
	};

	const openEditForm = (row: ExpenseTableViewRow) => {
		setErrorMessage(null);
		openRecord(row.id);
	};

	const onError = (error: unknown) => {
		const errorMessage = retrieveErrorMessage(error);
		setErrorMessage(t('status.errorSavingExpense', { error: errorMessage }));
		console.error('Expense Form Error', { error });
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={{
					...expensesTableConfig,
					title: t('table.expenses'),
					emptyMessage: t('table.noExpenses'),
				}}
				titleInfoTooltip={t('table.expensesTooltip')}
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: t('actions.addExpense'),
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
			/>

			<RecordDialog
				open={open}
				onOpenChange={onOpenChange}
				title={expenseId ? t('dialog.editExpense') : t('dialog.addExpense')}
				tabs={expenseId ? [auditLogTab('expense', expenseId)] : []}
			>
				{errorMessage && (
					<Alert variant="destructive">
						<AlertTitle>{t('common.error')}</AlertTitle>
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
				)}
				<ExpensesForm
					expenseId={expenseId}
					onSuccess={() => onOpenChange(false)}
					onCancel={() => onOpenChange(false)}
					onError={onError}
				/>
			</RecordDialog>
		</>
	);
}
