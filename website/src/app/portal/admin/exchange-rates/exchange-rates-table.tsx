'use client';

import { Button } from '@/components/button';
import { makeExchangeRatesColumns } from '@/components/data-table/columns/exchange-rates';
import DataTable from '@/components/data-table/data-table';
import { importExchangeRatesAction } from '@/lib/server-actions/exchange-rates-actions';
import { ExchangeRatesTableViewRow } from '@/lib/services/exchange-rate/exchange-rate.types';
import { useState, useTransition } from 'react';

export default function ExchangeRatesTable({ rows, error }: { rows: ExchangeRatesTableViewRow[]; error: string | null }) {
  const [isLoading, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const triggerImport = () => {
    setErrorMessage(undefined);
    startTransition(async () => {
      const result = await importExchangeRatesAction();
      if (!result.success) {
        setErrorMessage(result.error);
      }
    });
  };

  return (
    <DataTable
      title="Exchange Rates for last month"
      error={error || errorMessage}
      emptyMessage="No exchange rates found"
      data={rows}
      makeColumns={makeExchangeRatesColumns}
      actions={
        <Button disabled={isLoading} onClick={triggerImport}>
          {isLoading ? 'Importing...' : 'Import last month'}
        </Button>
      }
    />
  );
}
