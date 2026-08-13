'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { type SubscriptionCancellationReason } from '@/generated/prisma/enums';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { type WebsiteLanguage } from '@/lib/i18n/utils';
import { createUpdatePaymentMethodSessionAction } from '@/lib/server-actions/subscription-actions';
import { SUBSCRIPTION_CANCEL_REASONS } from '@/lib/services/subscription/subscription-cancellation';
import { formatCurrencyLocale, formatDateLocale, wholeCurrencyFormatOptions } from '@/lib/utils/string-utils';
import { useMachine } from '@xstate/react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SubscriptionPaymentMethodDisplay } from '../subscription-payment-method-display';
import { CancelReasonStep } from './cancel-reason-step';
import { CancelRetentionStep } from './cancel-retention-step';
import { editSubscriptionMachine, type EditSubscriptionOpenInput } from './edit-subscription-machine';
import { EditSubscriptionStep } from './edit-subscription-step';
import { EditSubscriptionSuccessStep } from './edit-subscription-success-step';

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
	const translator = useTranslator(lang, 'website-me');
	const router = useRouter();
	const [isUpdatingCard, startUpdateCardTransition] = useTransition();
	const [updateCardError, setUpdateCardError] = useState(false);
	const isOpen = !state.matches('closed');
	const t = (key: string) => translator?.t(key) ?? '';

	const openInput = {
		subscriptionId: subscription.subscriptionId,
		initialAmount: subscription.initialAmount,
		currency: subscription.currency,
		brand: subscription.brand,
		last4: subscription.last4,
	};

	const handleUpdateCard = () => {
		setUpdateCardError(false);
		startUpdateCardTransition(async () => {
			const result = await createUpdatePaymentMethodSessionAction();
			if (!result.success || !result.data) {
				setUpdateCardError(true);

				return;
			}

			window.location.assign(result.data);
		});
	};

	const dismissAndRefresh = () => {
		send({ type: 'DONE' });
		router.refresh();
	};

	const showUpdateError = (Boolean(state.context.error) && state.matches('editing')) || updateCardError;
	const showCancelError = Boolean(state.context.error) && state.matches('reason');
	const showBackButton = state.matches('retention') || state.matches('reason');
	const isCanceledSuccess = state.matches('canceledSuccess');
	const isSuccessStep = state.matches('success') || isCanceledSuccess;

	const reasonLabels = Object.fromEntries(
		SUBSCRIPTION_CANCEL_REASONS.map((reason) => [reason, t(`subscriptions.edit-dialog.cancel-reasons.${reason}`)]),
	) as Record<SubscriptionCancellationReason, string>;

	const dialogTitle = isCanceledSuccess
		? t('subscriptions.edit-dialog.cancel-success-title')
		: state.matches('success')
			? t('subscriptions.edit-dialog.success-title')
			: state.matches('retention')
				? t('subscriptions.edit-dialog.cancel-retention-title')
				: state.matches('reason') || state.matches('canceling')
					? t('subscriptions.edit-dialog.cancel-reason-title')
					: t('subscriptions.edit-dialog.title');

	const successLabels = {
		message: t(
			isCanceledSuccess ? 'subscriptions.edit-dialog.cancel-success-message' : 'subscriptions.edit-dialog.success-message',
		),
		thanks: t(
			isCanceledSuccess ? 'subscriptions.edit-dialog.cancel-success-thanks' : 'subscriptions.edit-dialog.success-thanks',
		),
		done: t('subscriptions.edit-dialog.done'),
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

			<Dialog
				open={isOpen}
				onOpenChange={(nextOpen) => {
					if (!nextOpen) {
						if (isSuccessStep) {
							dismissAndRefresh();

							return;
						}
						setUpdateCardError(false);
						send({ type: 'CLOSE' });
					}
				}}
			>
				<DialogContent
					className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]"
					onOpenAutoFocus={(event) => event.preventDefault()}
				>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							{showBackButton && (
								<button
									type="button"
									className="text-muted-foreground hover:text-foreground -ml-1 rounded-sm p-1"
									onClick={() => send({ type: 'BACK' })}
									aria-label={t('subscriptions.edit-dialog.back')}
									data-testid="edit-subscription-back"
								>
									<ChevronLeft className="size-5" aria-hidden />
								</button>
							)}
							<span>{dialogTitle}</span>
						</DialogTitle>
					</DialogHeader>

					{isSuccessStep ? (
						<div data-testid={isCanceledSuccess ? 'cancel-success-step' : undefined}>
							<EditSubscriptionSuccessStep labels={successLabels} onDone={dismissAndRefresh} />
						</div>
					) : state.matches('retention') ? (
						<CancelRetentionStep
							currency={state.context.currency}
							labels={{
								heading: t('subscriptions.edit-dialog.cancel-retention-heading'),
								cardTitle: t('subscriptions.edit-dialog.cancel-retention-card-title'),
								other: t('subscriptions.edit-dialog.cancel-retention-other'),
								or: t('subscriptions.edit-dialog.cancel-retention-or'),
								continueCancel: t('subscriptions.edit-dialog.cancel-retention-continue'),
							}}
							onReduceAmount={(value) => send({ type: 'REDUCE_AMOUNT', value })}
							onContinueCancel={() => send({ type: 'CONTINUE_CANCEL' })}
						/>
					) : state.matches('reason') || state.matches('canceling') ? (
						<CancelReasonStep
							selectedReason={state.context.cancellationReason}
							reasonLabels={reasonLabels}
							labels={{
								heading: t('subscriptions.edit-dialog.cancel-reason-heading'),
								confirm: t('subscriptions.edit-dialog.cancel-reason-confirm'),
							}}
							error={showCancelError ? t('subscriptions.edit-dialog.cancel-error') : undefined}
							isSubmitting={state.matches('canceling')}
							onSelectReason={(value) => send({ type: 'SET_CANCEL_REASON', value })}
							onConfirm={() => send({ type: 'CONFIRM_CANCEL' })}
						/>
					) : (
						<EditSubscriptionStep
							amount={state.context.amount}
							initialAmount={state.context.initialAmount}
							currency={state.context.currency}
							brand={state.context.brand}
							last4={state.context.last4}
							error={showUpdateError ? t('subscriptions.edit-dialog.error') : undefined}
							isSubmitting={state.matches('submitting')}
							isUpdatingCard={isUpdatingCard}
							labels={{
								monthlyContribution: t('subscriptions.edit-dialog.monthly-contribution'),
								perMonthSuffix: t('subscriptions.edit-dialog.per-month-suffix'),
								updateCard: t('subscriptions.edit-dialog.update-card'),
								cancelSubscription: t('subscriptions.edit-dialog.cancel-subscription'),
								cancel: t('subscriptions.edit-dialog.cancel'),
								updateSubscription: t('subscriptions.edit-dialog.update-subscription'),
								cardFallback: t('subscriptions.card-fallback'),
							}}
							onAmountChange={(value) => send({ type: 'SET_AMOUNT', value })}
							onCancel={() => send({ type: 'CLOSE' })}
							onStartCancel={() => send({ type: 'START_CANCEL' })}
							onSubmit={() => send({ type: 'SUBMIT' })}
							onUpdateCard={handleUpdateCard}
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};
