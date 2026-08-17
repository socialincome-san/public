'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { StatusCell } from '@/components/data-table/elements/status-cell';
import { TextCell } from '@/components/data-table/elements/text-cell';
import { type PaymentEventType } from '@/generated/prisma/client';
import { Translator } from '@/lib/i18n/translator';
import type { YourContributionsTableViewRow } from '@/lib/services/contribution/contribution.types';
import type { ColumnDef } from '@tanstack/react-table';
import { CurrencyCell } from '../elements/currency-cell';

const paymentEventTypeSourceKeys: Record<PaymentEventType, string> = {
	stripe: 'contributions.sources.stripe',
	bank_transfer: 'contributions.sources.wire-transfer',
	benevity: 'contributions.sources.benevity',
	cash: 'contributions.sources.cash',
	raisenow: 'contributions.sources.raisenow',
};

export const makeYourContributionsColumns = (
	_hideProgramName = false,
	_hideLocalPartner = false,
	translator?: Translator,
): ColumnDef<YourContributionsTableViewRow>[] => {
	void _hideProgramName;
	void _hideLocalPartner;

	return [
		{
			accessorKey: 'updatedAt',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('contributions.updated')}</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('contributions.created')}</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'status',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('contributions.status-title')}</SortableHeader>,
			cell: (ctx) => <StatusCell ctx={ctx} variant="contribution" />,
		},
		{
			accessorKey: 'amount',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('contributions.amount')}</SortableHeader>,
			cell: (ctx) => <CurrencyCell ctx={ctx} currency={ctx.row.original.currency} />,
		},
		{
			accessorKey: 'paymentEventType',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('contributions.payment-type')}</SortableHeader>,
			cell: (ctx) => {
				const type = ctx.row.original.paymentEventType;
				const translatedValue = type ? translator?.t(paymentEventTypeSourceKeys[type]) : undefined;

				return <TextCell ctx={ctx} translatedValue={translatedValue} />;
			},
		},
		{
			id: 'attribution',
			accessorFn: (row) => row.campaignTitle,
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('contributions.attribution')}</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
	];
};
