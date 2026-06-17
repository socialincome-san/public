'use client';

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

const columnLabel = (
	localizeLabels: boolean,
	translator: Translator | undefined,
	key: string,
	fallback: string,
) => (localizeLabels && translator ? translator.t(`program-detail-page.${key}`) : fallback);

export const makeRecipientColumns = (
	hideProgramName = false,
	hideLocalPartner = false,
	translator?: Translator,
	readOnly = false,
	localizeLabels = false,
): ColumnDef<RecipientTableViewRow>[] => {
	const columns: ColumnDef<RecipientTableViewRow>[] = [
		{
			accessorKey: 'firebaseAuthUserId',
			header: 'Firebase Auth User ID',
			cell: (ctx) => <IdCell ctx={ctx} />,
		},
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
		{
			accessorKey: 'paymentCode',
			header: (ctx) => <SortableHeader ctx={ctx}>Payment code</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
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

	if (!hideProgramName) {
		columns.push({
			accessorKey: 'programName',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>{columnLabel(localizeLabels, translator, 'column-program', 'Program')}</SortableHeader>
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

export const makePublicRecipientColumns = (translator?: Translator): ColumnDef<PublicRecipientTableViewRow>[] =>
	makeRecipientColumns(true, false, translator, true, true).filter((column) => {
		if (!('accessorKey' in column)) {
			return true;
		}

		return column.accessorKey !== 'firebaseAuthUserId' && column.accessorKey !== 'paymentCode';
	}) as ColumnDef<PublicRecipientTableViewRow>[];
