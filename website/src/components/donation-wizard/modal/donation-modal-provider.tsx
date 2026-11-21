'use client';

import { trackEvent } from '@/lib/analytics/analytics';
import { useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { getPaidStripeCheckoutDonationAction } from '@/modules/stripe-payments/stripe-payment.actions';
import { SegmentedToggle } from '@socialincome/design-system/actions/segmented-toggle/segmented-toggle';
import { cn } from '@socialincome/design-system/cn';
import { Dialog, DialogContent, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { useMachine } from '@xstate/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, type ReactNode } from 'react';
import { useDonationCampaignTitle } from '../hooks/use-donation-campaign-title';
import { DonationModalContext } from '../hooks/use-donation-modal';
import { DonationResumeBar } from '../resume-bar/donation-resume-bar';
import {
	clearResumableDonation,
	getResumableDonationVersion,
	resumableSteps,
	storeResumableDonation,
	type ResumableDonation,
} from '../resume-bar/resumable-donation';
import { DonationCurrencySelect } from '../shared/donation-currency-select';
import { requestStripeEmbeddedCheckout } from '../steps/step-stripe-checkout/request-stripe-embedded-checkout';
import {
	clearStoredStripeCheckoutContext,
	readStoredStripeCheckoutContext,
	STRIPE_CHECKOUT_SESSION_ID_PARAM,
} from '../steps/step-stripe-checkout/stripe-checkout-return';
import type { DonationAmountContext } from '../utils/donation-amount';
import { getDonationWizardLayout } from '../utils/donation-wizard-layout';
import { getDonationCompletedEvent, getDonationFunnelEvent } from '../wizard/donation-analytics';
import { donationWizardMachine } from '../wizard/donation-machine';
import { DonationSteps } from '../wizard/donation-steps';
import { DonationWizard } from '../wizard/donation-wizard';
import { getActiveWizardStep } from '../wizard/get-active-wizard-step';
import type { DonationWizardSend } from '../wizard/types';

type Props = {
	children: ReactNode;
};

// A Stripe return URL can be opened without a payment, so that case clears only once Stripe confirms it was paid.
const completionEvents = new Set<Parameters<DonationWizardSend>[0]['type']>([
	'STRIPE_CHECKOUT_COMPLETE',
	'QR_PAYMENT_CONFIRMED',
]);

export const DonationModalProvider = ({ children }: Props) => {
	const [state, , actorRef] = useMachine(donationWizardMachine);
	const websiteCurrency = useWebsiteCurrency();

	// Every step sends through here, so the funnel is tracked in one place with the context after the transition.
	const send = useCallback<DonationWizardSend>(
		(event) => {
			const previous = actorRef.getSnapshot();
			// Every way of closing (button, backdrop, swipe) lands here, so the bar can offer what was left unfinished.
			if (event.type === 'CLOSE') {
				// While the impact numbers load, the wizard already shows the step it is about to enter.
				const step = resumableSteps.find(
					(resumableStep) =>
						previous.matches(resumableStep) ||
						(previous.matches('loadingCommunityStats') && previous.context.pendingStep === resumableStep),
				);
				if (step) {
					storeResumableDonation(step, previous.context);
				} else if (previous.matches('stepQrBill')) {
					// The donor may pay the QR bill from their bank, so the bar must not offer the same donation again.
					clearResumableDonation();
				}
			}

			const previousStep = previous.value;
			actorRef.send(event);
			const next = actorRef.getSnapshot();
			const changedStep = next.value !== previousStep;

			if (changedStep && completionEvents.has(event.type)) {
				clearResumableDonation();
			}

			const funnelEvent = getDonationFunnelEvent(event.type, changedStep, next.context);
			if (funnelEvent) {
				trackEvent(funnelEvent.name, funnelEvent.properties);
			}

			const { stripeCheckoutSessionId } = next.context;
			if (
				changedStep &&
				stripeCheckoutSessionId &&
				(event.type === 'STRIPE_CHECKOUT_COMPLETE' || event.type === 'OPEN_FROM_STRIPE_RETURN')
			) {
				// Only a checkout that Stripe reports as paid counts as a completed donation.
				const resumableVersion = getResumableDonationVersion();
				void getPaidStripeCheckoutDonationAction(stripeCheckoutSessionId).then((result) => {
					if (result.success) {
						clearResumableDonation(resumableVersion);
						const completedEvent = getDonationCompletedEvent(result.data);
						trackEvent(completedEvent.name, completedEvent.properties);
					}
				});
			}
		},
		[actorRef],
	);
	const t = useTranslations('donation-wizard');

	const isOpen = !state.matches('closed');
	const isThankYou = state.matches('stepThankYou');
	const isOnboardingPersonal = state.matches('stepOnboardingPersonal');
	const isOnboardingReferral = state.matches('stepOnboardingReferral');
	const isPostCheckoutStep = isThankYou || isOnboardingPersonal || isOnboardingReferral;
	const campaignId = state.context.campaignId;
	const canChangeCurrency = state.hasTag('currencyEditable');
	const showWizardHeader = !isPostCheckoutStep;
	const campaignTitle = useDonationCampaignTitle(campaignId, isOpen && showWizardHeader);
	const { isPlanStep } = getDonationWizardLayout(getActiveWizardStep(state));
	const canGoBack = state.can({ type: 'BACK' });
	const title = <DialogTitle size="xl">{t('modal.title')}</DialogTitle>;
	const currencySelect = canChangeCurrency ? (
		<div className="w-fit shrink-0">
			<DonationCurrencySelect
				value={state.context.currency}
				onChange={(currency) => send({ type: 'SET_CURRENCY', value: currency })}
			/>
		</div>
	) : null;
	const cadenceOptions = [
		{ value: 'monthly', label: t('stepAmount.monthly') },
		{ value: 'one-time', label: t('stepAmount.one-time') },
	] as const;

	useEffect(() => {
		const url = new URL(window.location.href);
		const sessionId = url.searchParams.get(STRIPE_CHECKOUT_SESSION_ID_PARAM);
		if (!sessionId) {
			return;
		}

		const context = readStoredStripeCheckoutContext(sessionId, websiteCurrency);

		send({ type: 'OPEN_FROM_STRIPE_RETURN', context, sessionId, currency: websiteCurrency });
		clearStoredStripeCheckoutContext(sessionId);
		url.searchParams.delete(STRIPE_CHECKOUT_SESSION_ID_PARAM);
		window.history.replaceState(null, '', url);
	}, [send, websiteCurrency]);

	const openWizardAtAmountStep = () => {
		send({ type: 'OPEN', currency: websiteCurrency });
	};

	const openWizardWithFormAmount = (context: DonationAmountContext) => {
		send({ type: 'OPEN_FROM_FORM', context });
	};

	const resumeDonation = ({ step, context }: ResumableDonation) => {
		send({ type: 'RESUME', context, step });
		// The card form is normally requested by the payment step's button, which a resumed donation skips.
		if (step === 'stepStripeCheckout') {
			void requestStripeEmbeddedCheckout(actorRef.getSnapshot().context, send);
		}
	};

	const openWizardAfterPayment = (context: DonationAmountContext, sessionId: string) => {
		// The wallet sheet may finish while the donor has opened the wizard; onboarding only starts from closed.
		if (!actorRef.getSnapshot().matches('closed')) {
			send({ type: 'CLOSE' });
		}
		send({ type: 'OPEN_FROM_STRIPE_RETURN', context, sessionId, currency: context.currency });
	};

	return (
		<DonationModalContext.Provider
			value={{ isOpen, openWizardAtAmountStep, openWizardWithFormAmount, resumeDonation, openWizardAfterPayment }}
		>
			{children}
			<DonationResumeBar />

			<Dialog
				open={isOpen}
				onOpenChange={(open) => {
					if (!open) {
						send({ type: 'CLOSE' });
					}
				}}
			>
				<DialogContent
					size={isThankYou ? 'sm' : 'lg'}
					padding="none"
					onBack={showWizardHeader && canGoBack ? () => send({ type: 'BACK' }) : undefined}
					backLabel={t('stepPlan.back')}
					toolbar={
						showWizardHeader && isPlanStep ? (
							<SegmentedToggle
								options={cadenceOptions}
								value={state.context.cadence}
								onValueChange={(value) => {
									const option = cadenceOptions.find((cadence) => cadence.value === value);
									if (option) {
										send({ type: 'SET_CADENCE', value: option.value });
									}
								}}
							/>
						) : undefined
					}
					toolbarStart={showWizardHeader ? title : undefined}
					toolbarEnd={showWizardHeader ? currencySelect : undefined}
					data-testid="donation-wizard-modal"
					data-clarity-mask="true"
				>
					{isPostCheckoutStep ? (
						<>
							<DialogTitle visuallyHidden>{t('thankYou.message')}</DialogTitle>
							<div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
								<DonationSteps state={state} send={send} />
							</div>
						</>
					) : (
						<>
							<DonationWizard
								state={state}
								send={send}
								header={
									// Scrolls with the content in the drawer; the centered dialog shows it in the toolbar
									<div
										className={cn(
											'flex flex-col gap-1 pb-5 sm:pt-0 sm:pb-5',
											canGoBack || isPlanStep ? 'pt-10' : 'pt-4 pr-12',
										)}
									>
										<div className="flex min-h-9 items-center justify-between gap-2 sm:hidden">
											{title}
											{currencySelect}
										</div>
										{campaignId && campaignTitle ? (
											<p className="text-muted-foreground line-clamp-2 text-sm leading-snug font-normal sm:pt-4">
												{t('modal.campaign-for', { title: campaignTitle })}
											</p>
										) : null}
									</div>
								}
							/>
						</>
					)}
				</DialogContent>
			</Dialog>
		</DonationModalContext.Provider>
	);
};
