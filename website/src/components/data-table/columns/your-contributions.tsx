'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import { Translator } from '@/lib/i18n/translator';
import type { YourContributionsTableViewRow } from '@/lib/services/contribution/contribution.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeYourContributionsColumns(
	_?: boolean,
	translator?: Translator,
): ColumnDef<YourContributionsTableViewRow>[] {
	return [
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('contributions.date')}</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'amount',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('contributions.amount')}</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
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
}
