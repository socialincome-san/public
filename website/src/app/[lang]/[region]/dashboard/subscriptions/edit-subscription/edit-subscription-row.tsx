'use client';

import { Button } from '@/components/button/button';
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
			<div
				className="border-border flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between"
				data-testid="edit-subscription-row"
			>
				<p className="text-base">
					<span className="font-semibold">
						{formatCurrencyLocale(subscription.initialAmount, subscription.currency, lang, wholeCurrencyFormatOptions)}
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
						className="bg-background"
						onClick={() => send({ type: 'OPEN', subscription: openInput })}
						aria-haspopup="dialog"
						aria-expanded={isOpen}
						data-testid="edit-subscription-trigger"
					>
						{labels.edit}
					</Button>
				</div>
			</div>

			<EditSubscriptionDialog lang={lang} state={state} send={send} onDismissAndRefresh={dismissAndRefresh} />
		</>
	);
};
