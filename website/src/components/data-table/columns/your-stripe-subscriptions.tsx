'use client';

import { CurrencyCell } from '@/components/data-table/elements/currency-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import { Translator } from '@/lib/i18n/translator';
import type { StripeSubscriptionRow } from '@/lib/services/stripe/stripe.types';
import type { ColumnDef } from '@tanstack/react-table';
import { PaymentMethodCell } from '../elements/payment-method-cell';
import { StatusCell } from '../elements/status-cell';

export function makeYourStripeSubscriptionsColumns(
	_?: boolean,
	translator?: Translator,
): ColumnDef<StripeSubscriptionRow>[] {
	return [
		{
			accessorKey: 'created',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('subscriptions.created')}</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} options={{ year: 'numeric', month: '2-digit', day: '2-digit' }} />,
		},
		{
			accessorKey: 'status',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('subscriptions.status-title')}</SortableHeader>,
			cell: (ctx) => {
				const label = translator?.t(`subscriptions.status.${ctx.row.original.status}`);
				return <StatusCell ctx={ctx} variant="subscription" label={label} />;
			},
		},
		{
			accessorKey: 'interval',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('subscriptions.interval')}</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} translatedValue={translator?.t(`subscriptions.interval-${ctx.getValue()}`)} />,
		},
		{
			id: 'paymentMethod',
			accessorFn: (row) => row.paymentMethod.label,
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('subscriptions.payment-method')}</SortableHeader>,
			cell: (ctx) => <PaymentMethodCell ctx={ctx} variant={ctx.row.original.paymentMethod.type} />,
		},
		{
			accessorKey: 'amount',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('subscriptions.amount')}</SortableHeader>,
			cell: (ctx) => {
				const currency = ctx.row.original.currency;
				return <CurrencyCell ctx={ctx} currency={currency} />;
			},
		},
	];
}
