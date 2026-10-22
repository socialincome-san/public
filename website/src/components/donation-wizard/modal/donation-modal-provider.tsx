'use client';

import { trackEvent } from '@/lib/analytics/analytics';
import { useVisitorCountryCode, useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { getPaidStripeCheckoutDonationAction } from '@/modules/stripe-payments/stripe-payment.actions';
import { Dialog, DialogContent, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { useMachine } from '@xstate/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, type ReactNode } from 'react';
import { useDonationCampaignTitle } from '../hooks/use-donation-campaign-title';
import { DonationModalContext } from '../hooks/use-donation-modal';
import {
	clearStoredStripeCheckoutContext,
	readStoredStripeCheckoutContext,
	STRIPE_CHECKOUT_SESSION_ID_PARAM,
} from '../steps/step-stripe-checkout/stripe-checkout-return';
import type { DonationAmountContext } from '../utils/donation-amount';
import { isDonationExampleCountryCode } from '../utils/donation-example-income';
import { getDonationCompletedEvent, getDonationFunnelEvent } from '../wizard/donation-analytics';
import { donationWizardMachine } from '../wizard/donation-machine';
import { DonationSteps } from '../wizard/donation-steps';
import { DonationWizard } from '../wizard/donation-wizard';
import type { DonationWizardSend } from '../wizard/types';

type Props = {
	children: ReactNode;
};

export const DonationModalProvider = ({ children }: Props) => {
	const [state, , actorRef] = useMachine(donationWizardMachine);
	const currency = useWebsiteCurrency();
	const visitorCountryCode = useVisitorCountryCode();
	const countryCode = visitorCountryCode && isDonationExampleCountryCode(visitorCountryCode) ? visitorCountryCode : null;

	// Every step sends through here, so the funnel is tracked in one place with the context after the transition.
	const send = useCallback<DonationWizardSend>(
		(event) => {
			const previousStep = actorRef.getSnapshot().value;
			actorRef.send(event);
			const next = actorRef.getSnapshot();
			const changedStep = next.value !== previousStep;

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
	const t = useTranslations('donation-wizard');

	const isOpen = !state.matches('closed');
	const isThankYou = state.matches('stepThankYou');
	const isOnboardingPersonal = state.matches('stepOnboardingPersonal');
	const isOnboardingReferral = state.matches('stepOnboardingReferral');
	const isPostCheckoutStep = isThankYou || isOnboardingPersonal || isOnboardingReferral;
	const campaignId = state.context.campaignId;
	const showWizardHeader = !isPostCheckoutStep;
	const campaignTitle = useDonationCampaignTitle(campaignId, isOpen && showWizardHeader);

	useEffect(() => {
		if (state.context.monthlyIncomeCurrency !== currency) {
			send({ type: 'SET_CURRENCY', value: currency });
		}
	}, [currency, send, state.context.monthlyIncomeCurrency]);

	useEffect(() => {
		const url = new URL(window.location.href);
		const sessionId = url.searchParams.get(STRIPE_CHECKOUT_SESSION_ID_PARAM);
		if (!sessionId) {
			return;
		}

		const context = readStoredStripeCheckoutContext(sessionId, currency);

		send({ type: 'OPEN_FROM_STRIPE_RETURN', context, sessionId, currency, countryCode });
		clearStoredStripeCheckoutContext(sessionId);
		url.searchParams.delete(STRIPE_CHECKOUT_SESSION_ID_PARAM);
		window.history.replaceState(null, '', url);
	}, [countryCode, currency, send]);

	const openWizardAtAmountStep = () => {
		send({ type: 'OPEN', currency, countryCode });
	};

	const openWizardWithFormAmount = (context: DonationAmountContext) => {
		send({ type: 'OPEN_FROM_FORM', context });
	};

	return (
		<DonationModalContext.Provider value={{ openWizardAtAmountStep, openWizardWithFormAmount }}>
			{children}

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
		</DonationModalContext.Provider>
	);
};
