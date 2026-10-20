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

const portalColumnLabels = {
	'column-recipient': 'table.recipientColumnRecipient',
	country: 'table.recipientColumnCountry',
	'column-status': 'table.recipientColumnStatus',
	'column-age': 'table.recipientColumnAge',
	'column-local-partner': 'table.recipientColumnLocalPartner',
	'start-date': 'table.recipientColumnStartDate',
	'column-progress': 'table.recipientColumnProgress',
	'column-created': 'table.recipientColumnCreated',
	'column-program': 'table.recipientColumnProgram',
	'column-firebase-auth-user-id': 'table.recipientColumnFirebaseId',
	'column-payment-code': 'table.recipientColumnPaymentCode',
} as const;

type RecipientColumnKey = keyof typeof portalColumnLabels;
type PortalColumnLabelKey = (typeof portalColumnLabels)[RecipientColumnKey];
type PortalColumnTranslator = (key: PortalColumnLabelKey, fallback: string) => string;

const recipientColumnLabel = (
	translator: ColumnLabelTranslator | undefined,
	portalTranslator: PortalColumnTranslator | undefined,
	key: RecipientColumnKey,
	fallback: string,
) => (portalTranslator ? portalTranslator(portalColumnLabels[key], fallback) : columnLabel(translator, key, fallback));

const buildRecipientLeadColumns = <TRow extends PublicRecipientTableViewRow>(
	translator?: ColumnLabelTranslator,
	portalTranslator?: PortalColumnTranslator,
): ColumnDef<TRow>[] => [
	{
		id: 'recipient',
		accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
		header: (ctx) => (
			<SortableHeader ctx={ctx}>
				{recipientColumnLabel(translator, portalTranslator, 'column-recipient', 'Recipient')}
			</SortableHeader>
		),
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		id: 'country',
		accessorFn: (row) => row.country ?? '',
		header: (ctx) => (
			<SortableHeader ctx={ctx}>{recipientColumnLabel(translator, portalTranslator, 'country', 'Country')}</SortableHeader>
		),
		cell: ({ row }) => <CountryFlagCell country={row.original.country} />,
	},
	{
		id: 'status',
		accessorFn: (row) => row.status,
		header: (ctx) => (
			<SortableHeader ctx={ctx}>
				{recipientColumnLabel(translator, portalTranslator, 'column-status', 'Status')}
			</SortableHeader>
		),
		cell: (ctx) => <StatusCell ctx={ctx} variant="recipient" />,
	},
];

const buildRecipientTailColumns = <TRow extends PublicRecipientTableViewRow>(
	hideLocalPartner: boolean,
	translator?: ColumnLabelTranslator,
	portalTranslator?: PortalColumnTranslator,
): ColumnDef<TRow>[] => {
	const columns: ColumnDef<TRow>[] = [
		{
			accessorKey: 'dateOfBirth',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>{recipientColumnLabel(translator, portalTranslator, 'column-age', 'Age')}</SortableHeader>
			),
			cell: (ctx) => <AgeCell ctx={ctx} />,
		},
	];

	if (!hideLocalPartner) {
		columns.push({
			accessorKey: 'localPartnerName',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>
					{recipientColumnLabel(translator, portalTranslator, 'column-local-partner', 'Local Partner')}
				</SortableHeader>
			),
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	columns.push(
		{
			accessorKey: 'startDate',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>
					{recipientColumnLabel(translator, portalTranslator, 'start-date', 'Start date')}
				</SortableHeader>
			),
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'payoutsProgressPercent',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>
					{recipientColumnLabel(translator, portalTranslator, 'column-progress', 'Progress')}
				</SortableHeader>
			),
			cell: (ctx) => <ProgressCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAt',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>
					{recipientColumnLabel(translator, portalTranslator, 'column-created', 'Created')}
				</SortableHeader>
			),
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
	);

	return columns;
};

const buildRecipientProgramColumn = (
	translator?: ColumnLabelTranslator,
	portalTranslator?: PortalColumnTranslator,
): ColumnDef<RecipientTableViewRow> => ({
	accessorKey: 'programName',
	header: (ctx) => (
		<SortableHeader ctx={ctx}>
			{recipientColumnLabel(translator, portalTranslator, 'column-program', 'Program')}
		</SortableHeader>
	),
	cell: (ctx) => <TextCell ctx={ctx} />,
});

export const makePublicRecipientColumns = (translator?: ColumnLabelTranslator): ColumnDef<PublicRecipientTableViewRow>[] => [
	...buildRecipientLeadColumns<PublicRecipientTableViewRow>(translator),
	...buildRecipientTailColumns<PublicRecipientTableViewRow>(false, translator),
];

export const makeRecipientColumns = (
	hideProgramName = false,
	hideLocalPartner = false,
	_t?: DataTableTranslator,
	readOnly = false,
	portalTranslator?: PortalColumnTranslator,
): ColumnDef<RecipientTableViewRow>[] => {
	const columns: ColumnDef<RecipientTableViewRow>[] = [
		{
			accessorKey: 'firebaseAuthUserId',
			header: recipientColumnLabel(undefined, portalTranslator, 'column-firebase-auth-user-id', 'Firebase Auth User ID'),
			cell: (ctx) => <IdCell ctx={ctx} />,
		},
		...buildRecipientLeadColumns<RecipientTableViewRow>(undefined, portalTranslator),
		{
			accessorKey: 'paymentCode',
			header: (ctx) => (
				<SortableHeader ctx={ctx}>
					{recipientColumnLabel(undefined, portalTranslator, 'column-payment-code', 'Payment code')}
				</SortableHeader>
			),
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		...buildRecipientTailColumns<RecipientTableViewRow>(hideLocalPartner, undefined, portalTranslator),
	];

	if (!hideProgramName) {
		const startDateIndex = columns.findIndex((column) => 'accessorKey' in column && column.accessorKey === 'startDate');
		columns.splice(startDateIndex, 0, buildRecipientProgramColumn(undefined, portalTranslator));
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
