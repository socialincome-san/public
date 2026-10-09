'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import type { MobileMoneyProviderTableViewRow } from '@/modules/mobile-money-providers/mobile-money-provider.types';
import { DataTableRowChevronCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';

export const makeMobileMoneyProviderColumns = (): ColumnDef<MobileMoneyProviderTableViewRow>[] => [
	{
		accessorKey: 'name',
		header: (ctx) => <SortableHeader ctx={ctx}>Name</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'parentName',
		header: (ctx) => <SortableHeader ctx={ctx}>Parent</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'payoutProcessLabel',
		header: (ctx) => <SortableHeader ctx={ctx}>Payout process</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'createdAt',
		header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
		cell: (ctx) => <DateCell ctx={ctx} />,
	},
	{
		id: 'actions',
		header: '',
		enableHiding: false,
		cell: () => <DataTableRowChevronCell />,
	},
];
