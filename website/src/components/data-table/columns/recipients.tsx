'use client';

import { columnLabel, type ColumnLabelTranslator } from '@/components/data-table/columns/column-label';
import { AgeCell } from '@/components/data-table/elements/age-cell';
import { CountryFlagCell } from '@/components/data-table/elements/country-flag-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { IdCell } from '@/components/data-table/elements/id-cell';
import { ProgressCell } from '@/components/data-table/elements/progress-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { StatusCell } from '@/components/data-table/elements/status-cell';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { DataTableTranslator } from '@/components/data-table/table-config.types';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import type { PublicRecipientTableViewRow, RecipientTableViewRow } from '@/modules/recipients/recipient.types';
import { DataTableRowChevronCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';

const buildRecipientLeadColumns = <TRow extends PublicRecipientTableViewRow>(
	translator?: ColumnLabelTranslator,
): ColumnDef<TRow>[] => [
	{
		id: 'recipient',
		accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
		header: (ctx) => <SortableHeader ctx={ctx}>{columnLabel(translator, 'column-recipient', 'Recipient')}</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		id: 'country',
		accessorFn: (row) => row.country ?? '',
		header: (ctx) => <SortableHeader ctx={ctx}>{columnLabel(translator, 'country', 'Country')}</SortableHeader>,
		cell: ({ row }) => <CountryFlagCell country={row.original.country} />,
	},
	{
		id: 'status',
		accessorFn: (row) => row.status,
		header: (ctx) => <SortableHeader ctx={ctx}>{columnLabel(translator, 'column-status', 'Status')}</SortableHeader>,
		cell: (ctx) => <StatusCell ctx={ctx} variant="recipient" />,
	},
];

const buildRecipientTailColumns = <TRow extends PublicRecipientTableViewRow>(
	hideLocalPartner: boolean,
	translator?: ColumnLabelTranslator,
): ColumnDef<TRow>[] => {
	const columns: ColumnDef<TRow>[] = [
		{
			accessorKey: 'dateOfBirth',
			header: (ctx) => <SortableHeader ctx={ctx}>{columnLabel(translator, 'column-age', 'Age')}</SortableHeader>,
			cell: (ctx) => <AgeCell ctx={ctx} />,
		},
	];

	if (!hideLocalPartner) {
		columns.push({
			accessorKey: 'localPartnerName',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>{columnLabel(translator, 'column-local-partner', 'Local Partner')}</SortableHeader>
			),
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	columns.push(
		{
			accessorKey: 'startDate',
			header: (ctx) => <SortableHeader ctx={ctx}>{columnLabel(translator, 'start-date', 'Start date')}</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'payoutsProgressPercent',
			header: (ctx) => <SortableHeader ctx={ctx}>{columnLabel(translator, 'column-progress', 'Progress')}</SortableHeader>,
			cell: (ctx) => <ProgressCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>{columnLabel(translator, 'column-created', 'Created')}</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
	);

	return columns;
};

const buildRecipientProgramColumn = (translator?: ColumnLabelTranslator): ColumnDef<RecipientTableViewRow> => ({
	accessorKey: 'programName',
	header: (ctx) => <SortableHeader ctx={ctx}>{columnLabel(translator, 'column-program', 'Program')}</SortableHeader>,
	cell: (ctx) => <TextCell ctx={ctx} />,
});

export const makePublicRecipientColumns = (translator?: ColumnLabelTranslator): ColumnDef<PublicRecipientTableViewRow>[] => [
	...buildRecipientLeadColumns<PublicRecipientTableViewRow>(translator),
	...buildRecipientTailColumns<PublicRecipientTableViewRow>(false, translator),
];

// Portal and partner space tables are English; the third parameter matches `DataTableConfig.makeColumns`.
export const makeRecipientColumns = (
	hideProgramName = false,
	hideLocalPartner = false,
	_t?: DataTableTranslator,
	readOnly = false,
): ColumnDef<RecipientTableViewRow>[] => {
	const columns: ColumnDef<RecipientTableViewRow>[] = [
		{
			accessorKey: 'firebaseAuthUserId',
			header: 'Firebase Auth User ID',
			cell: (ctx) => <IdCell ctx={ctx} />,
		},
		...buildRecipientLeadColumns<RecipientTableViewRow>(),
		{
			accessorKey: 'paymentCode',
			header: (ctx) => <SortableHeader ctx={ctx}>Payment code</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		...buildRecipientTailColumns<RecipientTableViewRow>(hideLocalPartner),
	];

	if (!hideProgramName) {
		const startDateIndex = columns.findIndex((column) => 'accessorKey' in column && column.accessorKey === 'startDate');
		columns.splice(startDateIndex, 0, buildRecipientProgramColumn());
	}

	if (!readOnly) {
		columns.push({
			id: 'actions',
			header: '',
			enableHiding: false,
			cell: () => <DataTableRowChevronCell />,
		});
	}

	return columns;
};
