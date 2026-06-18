'use client';

import { columnLabel } from '@/components/data-table/columns/column-label';
import { ActionCell } from '@/components/data-table/elements/action-cell';
import { AgeCell } from '@/components/data-table/elements/age-cell';
import { CountryFlagCell } from '@/components/data-table/elements/country-flag-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { IdCell } from '@/components/data-table/elements/id-cell';
import { ProgressCell } from '@/components/data-table/elements/progress-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { StatusCell } from '@/components/data-table/elements/status-cell';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { Translator } from '@/lib/i18n/translator';
import type { PublicRecipientTableViewRow, RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
import type { ColumnDef } from '@tanstack/react-table';

const buildRecipientLeadColumns = <TRow extends PublicRecipientTableViewRow>(
	translator?: Translator,
	localizeLabels = false,
): ColumnDef<TRow>[] => [
	{
		id: 'recipient',
		accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
		header: (ctx) => (
			<SortableHeader ctx={ctx}>{columnLabel(localizeLabels, translator, 'column-recipient', 'Recipient')}</SortableHeader>
		),
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		id: 'country',
		accessorFn: (row) => row.country ?? '',
		header: (ctx) => (
			<SortableHeader ctx={ctx}>{columnLabel(localizeLabels, translator, 'country', 'Country')}</SortableHeader>
		),
		cell: ({ row }) => <CountryFlagCell country={row.original.country} />,
	},
	{
		id: 'status',
		accessorFn: (row) => row.status,
		header: (ctx) => (
			<SortableHeader ctx={ctx}>{columnLabel(localizeLabels, translator, 'column-status', 'Status')}</SortableHeader>
		),
		cell: (ctx) => <StatusCell ctx={ctx} variant="recipient" />,
	},
];

const buildRecipientTailColumns = <TRow extends PublicRecipientTableViewRow>(
	hideLocalPartner: boolean,
	translator?: Translator,
	localizeLabels = false,
): ColumnDef<TRow>[] => {
	const columns: ColumnDef<TRow>[] = [
		{
			accessorKey: 'dateOfBirth',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>{columnLabel(localizeLabels, translator, 'column-age', 'Age')}</SortableHeader>
			),
			cell: (ctx) => <AgeCell ctx={ctx} />,
		},
	];

	if (!hideLocalPartner) {
		columns.push({
			accessorKey: 'localPartnerName',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>
					{columnLabel(localizeLabels, translator, 'column-local-partner', 'Local Partner')}
				</SortableHeader>
			),
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	columns.push(
		{
			accessorKey: 'startDate',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>{columnLabel(localizeLabels, translator, 'start-date', 'Start date')}</SortableHeader>
			),
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'payoutsProgressPercent',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>{columnLabel(localizeLabels, translator, 'column-progress', 'Progress')}</SortableHeader>
			),
			cell: (ctx) => <ProgressCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAt',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>{columnLabel(localizeLabels, translator, 'column-created', 'Created')}</SortableHeader>
			),
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
	);

	return columns;
};

const buildRecipientProgramColumn = (
	translator?: Translator,
	localizeLabels = false,
): ColumnDef<RecipientTableViewRow> => ({
	accessorKey: 'programName',
	header: (ctx) => (
		<SortableHeader ctx={ctx}>{columnLabel(localizeLabels, translator, 'column-program', 'Program')}</SortableHeader>
	),
	cell: (ctx) => <TextCell ctx={ctx} />,
});

export const makePublicRecipientColumns = (translator?: Translator): ColumnDef<PublicRecipientTableViewRow>[] => [
	...buildRecipientLeadColumns<PublicRecipientTableViewRow>(translator, true),
	...buildRecipientTailColumns<PublicRecipientTableViewRow>(false, translator, true),
];

export const makeRecipientColumns = (
	hideProgramName = false,
	hideLocalPartner = false,
	translator?: Translator,
	readOnly = false,
	localizeLabels = false,
	publicView = false,
): ColumnDef<RecipientTableViewRow>[] => {
	const columns: ColumnDef<RecipientTableViewRow>[] = [];

	if (!publicView) {
		columns.push({
			accessorKey: 'firebaseAuthUserId',
			header: 'Firebase Auth User ID',
			cell: (ctx) => <IdCell ctx={ctx} />,
		});
	}

	columns.push(...buildRecipientLeadColumns<RecipientTableViewRow>(translator, localizeLabels));

	if (!publicView) {
		columns.push({
			accessorKey: 'paymentCode',
			header: (ctx) => <SortableHeader ctx={ctx}>Payment code</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	columns.push(...buildRecipientTailColumns<RecipientTableViewRow>(hideLocalPartner, translator, localizeLabels));

	if (!hideProgramName) {
		const startDateIndex = columns.findIndex((column) => 'accessorKey' in column && column.accessorKey === 'startDate');
		columns.splice(startDateIndex, 0, buildRecipientProgramColumn(translator, localizeLabels));
	}

	if (!readOnly) {
		columns.push({
			id: 'actions',
			header: '',
			enableHiding: false,
			cell: (ctx) => <ActionCell ctx={ctx} />,
		});
	}

	return columns;
};
