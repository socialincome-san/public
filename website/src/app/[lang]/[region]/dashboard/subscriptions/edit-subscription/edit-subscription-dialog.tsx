'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/dialog';
import { type SubscriptionCancellationReason } from '@/generated/prisma/enums';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { type WebsiteLanguage } from '@/lib/i18n/utils';
import { createUpdatePaymentMethodSessionAction } from '@/lib/server-actions/subscription-actions';
import { SUBSCRIPTION_CANCEL_REASONS } from '@/lib/services/subscription/subscription-cancellation';
import { ChevronLeft } from 'lucide-react';
import { useState, useTransition } from 'react';
import { type ActorRefFrom, type SnapshotFrom } from 'xstate';
import { CancelReasonStep } from './cancel-reason-step';
import { CancelRetentionStep } from './cancel-retention-step';
import { editSubscriptionMachine } from './edit-subscription-machine';
import { EditSubscriptionStep } from './edit-subscription-step';
import { EditSubscriptionSuccessStep } from './edit-subscription-success-step';

type EditSubscriptionActor = ActorRefFrom<typeof editSubscriptionMachine>;
type EditSubscriptionSnapshot = SnapshotFrom<typeof editSubscriptionMachine>;

type Props = {
	lang: WebsiteLanguage;
	state: EditSubscriptionSnapshot;
	send: EditSubscriptionActor['send'];
	onDismissAndRefresh: () => void;
	canDownloadStandingOrderQr?: boolean;
};

export const EditSubscriptionDialog = ({ lang, state, send, onDismissAndRefresh, canDownloadStandingOrderQr }: Props) => {
	const translator = useTranslator(lang, 'website-me');
	const [isUpdatingCard, startUpdateCardTransition] = useTransition();
	const [updateCardError, setUpdateCardError] = useState(false);
	const [isConfirmingCardLeave, setIsConfirmingCardLeave] = useState(false);
	const t = (key: string) => translator?.t(key) ?? '';
	const isBankTransfer = state.context.paymentMethod === 'bank_transfer';
	const isCanceledSuccess = state.matches('canceledSuccess');
	const isInFlight = state.matches('submitting') || state.matches('canceling') || isUpdatingCard;
	const standingOrderSubscriptionId =
		canDownloadStandingOrderQr && isBankTransfer && state.matches('success')
			? (state.context.subscriptionId ?? undefined)
			: undefined;

	const startCardUpdate = () => {
		const subscriptionId = state.context.subscriptionId;
		if (!subscriptionId) {
			setUpdateCardError(true);

			return;
		}

		setUpdateCardError(false);
		startUpdateCardTransition(async () => {
			const result = await createUpdatePaymentMethodSessionAction(subscriptionId);
			if (!result.success || !result.data) {
				setUpdateCardError(true);

				return;
			}

			window.location.assign(result.data);
		});
	};

	const handleUpdateCard = () => {
		if (state.context.amount !== state.context.initialAmount) {
			setIsConfirmingCardLeave(true);

			return;
		}

		startCardUpdate();
	};

	const showAmountError = Boolean(state.context.error) && state.matches('editing');
	const showCancelError = Boolean(state.context.error) && state.matches('reason');
	const showBackButton = state.matches('retention') || state.matches('reason');
	const isSuccessStep = state.matches('success') || isCanceledSuccess;
	const isOpen = !state.matches('closed');

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

	const successMessageKey = isCanceledSuccess
		? isBankTransfer
			? 'subscriptions.edit-dialog.bank-cancel-success-message'
			: 'subscriptions.edit-dialog.cancel-success-message'
		: 'subscriptions.edit-dialog.success-message';

	const successLabels = {
		message: t(successMessageKey),
		thanks: t(
			isCanceledSuccess ? 'subscriptions.edit-dialog.cancel-success-thanks' : 'subscriptions.edit-dialog.success-thanks',
		),
		done: t('subscriptions.edit-dialog.done'),
		standingOrderTitle: t('subscriptions.edit-dialog.standing-order-title'),
		standingOrderDescription: t('subscriptions.edit-dialog.standing-order-description'),
		downloadQr: t('subscriptions.edit-dialog.download-qr'),
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					if (isInFlight) {
						return;
					}
					if (isSuccessStep) {
						onDismissAndRefresh();

						return;
					}
					setUpdateCardError(false);
					setIsConfirmingCardLeave(false);
					send({ type: 'CLOSE' });
				}
			}}
		>
			<DialogContent
				className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]"
				closeOnClickOutside={!isInFlight}
				closeOnEscape={!isInFlight}
				hideCloseButton={isInFlight}
				aria-busy={isInFlight}
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{showBackButton && (
							<button
								type="button"
								className="text-muted-foreground hover:text-primary -ml-1 rounded-sm p-1"
								onClick={() => send({ type: 'BACK' })}
								aria-label={t('subscriptions.edit-dialog.back')}
								data-testid="edit-subscription-back"
							>
								<ChevronLeft className="size-5" aria-hidden />
							</button>
						)}
						<span>{dialogTitle}</span>
					</DialogTitle>
					<DialogDescription className="sr-only">{dialogTitle}</DialogDescription>
				</DialogHeader>

				{isSuccessStep ? (
					<EditSubscriptionSuccessStep
						labels={successLabels}
						onDone={onDismissAndRefresh}
						standingOrderSubscriptionId={standingOrderSubscriptionId}
						testId={isCanceledSuccess ? 'cancel-success-step' : 'edit-subscription-success-step'}
					/>
				) : state.matches('retention') ? (
					<CancelRetentionStep
						amount={state.context.amount}
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
							canceling: t('subscriptions.edit-dialog.canceling-subscription'),
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
						error={
							updateCardError
								? t('subscriptions.edit-dialog.update-card-error')
								: showAmountError
									? t('subscriptions.edit-dialog.error')
									: undefined
						}
						isSubmitting={state.matches('submitting')}
						isUpdatingCard={isUpdatingCard}
						labels={{
							monthlyContribution: t('subscriptions.edit-dialog.monthly-contribution'),
							perMonthSuffix: t('subscriptions.edit-dialog.per-month-suffix'),
							updateCard: t('subscriptions.edit-dialog.update-card'),
							cancelSubscription: t('subscriptions.edit-dialog.cancel-subscription'),
							cancel: t('subscriptions.edit-dialog.cancel'),
							updateSubscription: t('subscriptions.edit-dialog.update-subscription'),
							updatingSubscription: t('subscriptions.edit-dialog.updating-subscription'),
							cardFallback: t('subscriptions.card-fallback'),
						}}
						onAmountChange={(value) => {
							setIsConfirmingCardLeave(false);
							send({ type: 'SET_AMOUNT', value });
						}}
						onCancel={() => send({ type: 'CLOSE' })}
						onStartCancel={() => send({ type: 'START_CANCEL' })}
						onSubmit={() => send({ type: 'SUBMIT' })}
						onUpdateCard={isBankTransfer ? undefined : handleUpdateCard}
						cardUpdateConfirm={
							isConfirmingCardLeave
								? {
										message: t('subscriptions.edit-dialog.update-card-unsaved-warning'),
										stayLabel: t('subscriptions.edit-dialog.update-card-stay'),
										leaveLabel: t('subscriptions.edit-dialog.update-card-leave'),
										onStay: () => setIsConfirmingCardLeave(false),
										onLeave: startCardUpdate,
									}
								: undefined
						}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
};
