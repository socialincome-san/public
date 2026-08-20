'use client';

import { Button } from '@/components/button/button';
import { type WebsiteLanguage } from '@/lib/i18n/utils';
import { getBaseAmountBeforeTransactionCostCoverage } from '@/lib/services/subscription/cover-transaction-costs';
import { formatCurrencyLocale, formatDateLocale, wholeCurrencyFormatOptions } from '@/lib/utils/string-utils';
import { useMachine } from '@xstate/react';
import { useRouter } from 'next/navigation';
import { CoverSubscriptionTransactionCostsPrompt } from '../cover-subscription-transaction-costs-prompt';
import { SubscriptionPaymentMethodDisplay } from '../subscription-payment-method-display';
import { EditSubscriptionDialog } from './edit-subscription-dialog';
import { editSubscriptionMachine, type EditSubscriptionOpenInput } from './edit-subscription-machine';

type Props = {
	lang: WebsiteLanguage;
	subscription: {
		subscriptionId: string;
		amount: number;
		currency: EditSubscriptionOpenInput['currency'];
		paymentMethod: EditSubscriptionOpenInput['paymentMethod'];
		coverTransactionCosts: boolean;
		createdAt: Date;
		brand?: string;
		last4?: string;
	};
	labels: {
		perMonth: string;
		since: string;
		wireTransfer: string;
		cardFallback: string;
		edit: string;
	};
};

export const EditSubscriptionRow = ({ lang, subscription, labels }: Props) => {
	const [state, send] = useMachine(editSubscriptionMachine);
	const router = useRouter();
	const isOpen = !state.matches('closed');
	const baseAmount = subscription.coverTransactionCosts
		? getBaseAmountBeforeTransactionCostCoverage(subscription.amount)
		: Math.round(subscription.amount);

	const openInput = (options: { preselectCoverTransactionCosts?: boolean } = {}): EditSubscriptionOpenInput => ({
		subscriptionId: subscription.subscriptionId,
		initialAmount: baseAmount,
		currency: subscription.currency,
		paymentMethod: subscription.paymentMethod,
		brand: subscription.brand,
		last4: subscription.last4,
		coverTransactionCosts: subscription.coverTransactionCosts,
		preselectCoverTransactionCosts: options.preselectCoverTransactionCosts,
	});

	const dismissAndRefresh = () => {
		send({ type: 'DONE' });
		router.refresh();
	};

	const subscriptionRow = (
		<div
			className="bg-background flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-6"
			data-testid="edit-subscription-row"
		>
			<p className="text-base">
				<span className="font-semibold">
					{formatCurrencyLocale(baseAmount, subscription.currency, lang, wholeCurrencyFormatOptions)}
				</span>{' '}
				<span className="text-muted-foreground">
					{labels.perMonth} · {labels.since} {formatDateLocale(subscription.createdAt, lang)}
				</span>
			</p>
			<div className="flex flex-wrap items-center gap-3">
				<SubscriptionPaymentMethodDisplay
					paymentDisplay={{
						type: 'stripe',
						brand: subscription.brand,
						last4: subscription.last4,
					}}
					labels={labels}
				/>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="bg-background ml-auto sm:ml-0"
					onClick={() => send({ type: 'OPEN', subscription: openInput() })}
					aria-haspopup="dialog"
					aria-expanded={isOpen}
					data-testid="edit-subscription-trigger"
				>
					{labels.edit}
				</Button>
			</div>
		</div>
	);

	return (
		<>
			{!subscription.coverTransactionCosts ? (
				<div className="border-border overflow-hidden rounded-xl border">
					{subscriptionRow}
					<CoverSubscriptionTransactionCostsPrompt
						lang={lang}
						amount={baseAmount}
						currency={subscription.currency}
						onOpen={() => send({ type: 'OPEN', subscription: openInput({ preselectCoverTransactionCosts: true }) })}
					/>
				</div>
			) : (
				<div className="border-border overflow-hidden rounded-xl border">{subscriptionRow}</div>
			)}

			<EditSubscriptionDialog lang={lang} state={state} send={send} onDismissAndRefresh={dismissAndRefresh} />
		</>
	);
};
