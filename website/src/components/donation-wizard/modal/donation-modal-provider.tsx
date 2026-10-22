'use client';

import { trackEvent } from '@/lib/analytics/analytics';
import { useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { getPaidStripeCheckoutDonationAction } from '@/modules/stripe-payments/stripe-payment.actions';
import { Button } from '@socialincome/design-system/actions/button/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/overlays/dialog/dialog';
import { useMachine } from '@xstate/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useDonationCampaignTitle } from '../hooks/use-donation-campaign-title';
import { DonationModalContext } from '../hooks/use-donation-modal';
import { DonationResumeBar } from '../resume-bar/donation-resume-bar';
import { clearResumableDonation, storeResumableDonation, toResumableDonation } from '../resume-bar/resumable-donation';
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

// Steps after the amount is chosen and before anything is paid or a QR bill exists.
const resumableSteps = ['stepPlanMonthly', 'stepPlanOneTime', 'stepPayment', 'stepStripeCheckout', 'stepQrContact'] as const;

const completionEvents = new Set<Parameters<DonationWizardSend>[0]['type']>([
	'STRIPE_CHECKOUT_COMPLETE',
	'OPEN_FROM_STRIPE_RETURN',
	'QR_PAYMENT_CONFIRMED',
]);

export const DonationModalProvider = ({ children }: Props) => {
	const [state, , actorRef] = useMachine(donationWizardMachine);
	const currency = useWebsiteCurrency();

	// Every step sends through here, so the funnel is tracked in one place with the context after the transition.
	const send = useCallback<DonationWizardSend>(
		(event) => {
			const previousStep = actorRef.getSnapshot().value;
			actorRef.send(event);
			const next = actorRef.getSnapshot();
			const changedStep = next.value !== previousStep;

			if (changedStep && completionEvents.has(event.type)) {
				clearResumableDonation();
			}

			const funnelEvent = getDonationFunnelEvent(event.type, changedStep, next.context, currency);
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
				void getPaidStripeCheckoutDonationAction(stripeCheckoutSessionId).then((result) => {
					if (result.success) {
						const completedEvent = getDonationCompletedEvent(result.data);
						trackEvent(completedEvent.name, completedEvent.properties);
					}
				});
			}
		},
		[actorRef, currency],
	);
	const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
	const t = useTranslations('donation-wizard');

	const isOpen = !state.matches('closed');
	const isThankYou = state.matches('stepThankYou');
	const isOnboardingPersonal = state.matches('stepOnboardingPersonal');
	const isOnboardingReferral = state.matches('stepOnboardingReferral');
	const isPostCheckoutStep = isThankYou || isOnboardingPersonal || isOnboardingReferral;
	const isNarrowModal = isThankYou;
	const campaignId = state.context.campaignId;
	const showWizardHeader = !isPostCheckoutStep;
	const campaignTitle = useDonationCampaignTitle(campaignId, isOpen && showWizardHeader);

	useEffect(() => {
		const url = new URL(window.location.href);
		const sessionId = url.searchParams.get(STRIPE_CHECKOUT_SESSION_ID_PARAM);
		if (!sessionId) {
			return;
		}

		const context = readStoredStripeCheckoutContext(sessionId);

		send({ type: 'OPEN_FROM_STRIPE_RETURN', context, sessionId });
		clearStoredStripeCheckoutContext(sessionId);
		url.searchParams.delete(STRIPE_CHECKOUT_SESSION_ID_PARAM);
		window.history.replaceState(null, '', url);
	}, [send]);

	const openWizardAtAmountStep = () => {
		send({ type: 'OPEN' });
	};

	const openWizardWithFormAmount = (context: DonationAmountContext) => {
		send({ type: 'OPEN_FROM_FORM', context });
	};

	const resumeDonation = (context: DonationAmountContext) => {
		send({ type: 'RESUME', context });
	};

	const closeWizard = () => {
		const snapshot = actorRef.getSnapshot();
		const donation = resumableSteps.some((step) => snapshot.matches(step))
			? toResumableDonation(snapshot.context, snapshot.matches('stepPayment') || snapshot.matches('stepStripeCheckout'))
			: null;
		if (donation) {
			storeResumableDonation(donation);
		} else if (snapshot.matches('stepQrBill')) {
			// The donor may pay the QR bill from their bank, so the bar must not offer the same donation again.
			clearResumableDonation();
		}
		setCloseConfirmOpen(false);
		send({ type: 'CLOSE' });
	};

	const openWizardAfterPayment = (context: DonationAmountContext, sessionId: string) => {
		clearResumableDonation();
		// The wallet sheet may finish while the donor has opened the wizard; onboarding only starts from closed.
		if (!actorRef.getSnapshot().matches('closed')) {
			send({ type: 'CLOSE' });
		}
		send({ type: 'OPEN_FROM_STRIPE_RETURN', context, sessionId });
	};

	const requestClose = () => {
		if (isThankYou) {
			closeWizard();

			return;
		}

		setCloseConfirmOpen(true);
	};

	const confirmClose = () => {
		closeWizard();
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
						requestClose();
					}
				}}
			>
				<DialogContent
					size={isNarrowModal ? 'sm' : 'lg'}
					surface="gradient"
					padding="none"
					closeOnClickOutside={false}
					closeOnEscape={false}
					onCloseClick={requestClose}
					data-testid="donation-wizard-modal"
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
							<div className="flex shrink-0 flex-col gap-1 px-4 pt-[max(1rem,env(safe-area-inset-top))] pr-14 pb-4 sm:px-6 sm:pt-6 sm:pr-20 sm:pb-6 md:pl-9">
								<div className="flex min-h-9 items-center">
									<DialogTitle size="lg">{t('modal.title')}</DialogTitle>
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

			<Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
				<DialogContent size="alert" hideCloseButton>
					<DialogHeader divided={false}>
						<DialogTitle>{t('modal.closeConfirm.title')}</DialogTitle>
						<DialogDescription>{t('modal.closeConfirm.description')}</DialogDescription>
					</DialogHeader>
					<DialogFooter divided={false}>
						<Button type="button" variant="outline" onClick={() => setCloseConfirmOpen(false)}>
							{t('modal.closeConfirm.cancel')}
						</Button>
						<Button type="button" variant="destructive" onClick={confirmClose}>
							{t('modal.closeConfirm.confirm')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</DonationModalContext.Provider>
	);
};
