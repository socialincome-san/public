'use client';

import { type WebsiteLanguage } from '@/lib/i18n/utils';
import { formatCurrencyLocale, formatDateLocale, wholeCurrencyFormatOptions } from '@/lib/utils/string-utils';
import { useMachine } from '@xstate/react';
import { useRouter } from 'next/navigation';
import { SubscriptionPaymentMethodDisplay } from '../subscription-payment-method-display';
import { EditSubscriptionDialog } from './edit-subscription-dialog';
import { editSubscriptionMachine, type EditSubscriptionOpenInput } from './edit-subscription-machine';

type Props = {
	lang: WebsiteLanguage;
	subscription: EditSubscriptionOpenInput & {
		createdAt: Date;
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

	const openInput: EditSubscriptionOpenInput = {
		subscriptionId: subscription.subscriptionId,
		initialAmount: subscription.initialAmount,
		currency: subscription.currency,
		paymentMethod: subscription.paymentMethod,
		brand: subscription.brand,
		last4: subscription.last4,
	};

	const dismissAndRefresh = () => {
		send({ type: 'DONE' });
		router.refresh();
	};

	return (
		<>
			<button
				type="button"
				className="border-border hover:bg-muted/40 focus-visible:ring-ring flex w-full cursor-pointer flex-col gap-4 rounded-xl border p-6 text-left transition-colors focus-visible:ring-2 focus-visible:outline-hidden sm:flex-row sm:items-center sm:justify-between"
				onClick={() => send({ type: 'OPEN', subscription: openInput })}
				aria-haspopup="dialog"
				aria-expanded={isOpen}
				data-testid="edit-subscription-trigger"
			>
				<p className="text-base">
					<span className="font-semibold">
						{formatCurrencyLocale(subscription.initialAmount, subscription.currency, lang, wholeCurrencyFormatOptions)}
					</span>{' '}
					<span className="text-muted-foreground">
						{labels.perMonth} · {labels.since} {formatDateLocale(subscription.createdAt, lang)}
					</span>
				</p>
				<div className="flex flex-wrap items-center gap-4">
					<SubscriptionPaymentMethodDisplay
						paymentDisplay={{
							type: 'stripe',
							brand: subscription.brand,
							last4: subscription.last4,
						}}
						labels={labels}
					/>
					<span className="border-input bg-background/5 inline-flex h-8 items-center justify-center rounded-full border px-3 text-xs font-medium">
						{labels.edit}
					</span>
				</div>
			</button>

			<EditSubscriptionDialog lang={lang} state={state} send={send} onDismissAndRefresh={dismissAndRefresh} />
		</>
	);
};
