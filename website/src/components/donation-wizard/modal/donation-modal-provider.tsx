'use client';

import { trackEvent } from '@/lib/analytics/analytics';
import { useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { getPaidStripeCheckoutDonationAction } from '@/modules/stripe-payments/stripe-payment.actions';
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
import { getDonationCompletedEvent, getDonationFunnelEvent } from '../wizard/donation-analytics';
import { donationWizardMachine } from '../wizard/donation-machine';
import { DonationSteps } from '../wizard/donation-steps';
import { DonationWizard } from '../wizard/donation-wizard';
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
				const step = resumableSteps.find((resumableStep) => previous.matches(resumableStep));
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
				<DialogContent size={isThankYou ? 'sm' : 'lg'} surface="gradient" padding="none" data-testid="donation-wizard-modal">
					{isPostCheckoutStep ? (
						<>
							<DialogTitle visuallyHidden>{t('thankYou.message')}</DialogTitle>
							<div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
								<DonationSteps state={state} send={send} />
							</div>
						</>
					) : (
						<>
							<div className="flex shrink-0 flex-col gap-1 px-4 pt-4 pr-14 pb-4 sm:px-6 sm:pt-6 sm:pr-20 sm:pb-6 md:pl-9">
								<div className="flex min-h-9 items-center justify-between gap-2 sm:gap-3">
									<DialogTitle size="lg">{t('modal.title')}</DialogTitle>
									{canChangeCurrency ? (
										<div className="w-24 shrink-0">
											<DonationCurrencySelect
												value={state.context.currency}
												onChange={(currency) => send({ type: 'SET_CURRENCY', value: currency })}
											/>
										</div>
									) : null}
								</div>
								{campaignId && campaignTitle ? (
									<p className="text-muted-foreground line-clamp-2 text-sm leading-snug font-normal">
										{t('modal.campaign-for', { title: campaignTitle })}
									</p>
								) : null}
							</div>
							<DonationWizard state={state} send={send} />
						</>
					)}
				</DialogContent>
			</Dialog>
		</DonationModalContext.Provider>
	);
};
