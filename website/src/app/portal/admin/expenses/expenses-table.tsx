'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { makeExpenseColumns } from '@/components/data-table/columns/expenses';
import DataTable from '@/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import type { ExpenseTableViewRow } from '@/lib/services/expense/expense.types';
import { logger } from '@/lib/utils/logger';
import { useState } from 'react';
import ExpensesForm from './expenses-form';

export default function ExpensesTable({ rows, error }: { rows: ExpenseTableViewRow[]; error: string | null }) {
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
    setErrorMessage(`Error saving expense: ${error}`);
    logger.error('Expense Form Error', { error });
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
