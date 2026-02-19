'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import { Translator } from '@/lib/i18n/translator';
import type { YourContributionsTableViewRow } from '@/lib/services/contribution/contribution.types';
import type { ColumnDef } from '@tanstack/react-table';
import { CurrencyCell } from '../elements/currency-cell';

export const makeYourContributionsColumns = (
  hideProgramName = false,
  hideLocalPartner = false,
  translator?: Translator,
): ColumnDef<YourContributionsTableViewRow>[] => {
  return [
    {
      accessorKey: 'createdAt',
      header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('contributions.date')}</SortableHeader>,
      cell: (ctx) => <DateCell ctx={ctx} />,
    },
    {
      accessorKey: 'amount',
      header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('contributions.amount')}</SortableHeader>,
      cell: (ctx) => {
        const currency = ctx.row.original.currency;

        return <CurrencyCell ctx={ctx} currency={currency} />;
      },
    },
    {
      accessorKey: 'currency',
      header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('contributions.currency')}</SortableHeader>,
      cell: (ctx) => <TextCell ctx={ctx} />,
    },
    {
      accessorKey: 'campaignTitle',
      header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('contributions.campaign')}</SortableHeader>,
      cell: (ctx) => <TextCell ctx={ctx} />,
    },
  ];
};
