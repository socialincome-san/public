'use client';

import { DonationCurrencySelector } from '@/components/donation/currency-selector';
import { useRouteTranslator } from '@/lib/i18n/use-route-translator';
import { websiteCurrencies } from '@/lib/i18n/utils';
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
import { useEffect, useState, type ReactNode } from 'react';
import { useDonationCampaignTitle } from '../hooks/use-donation-campaign-title';
import { DonationModalContext } from '../hooks/use-donation-modal';
import {
	clearStoredStripeCheckoutContext,
	readStoredStripeCheckoutContext,
	STRIPE_CHECKOUT_SESSION_ID_PARAM,
} from '../steps/step-stripe-checkout/stripe-checkout-return';
import type { DonationAmountContext } from '../utils/donation-amount';
import { donationWizardMachine } from '../wizard/donation-machine';
import { DonationSteps } from '../wizard/donation-steps';
import { DonationWizard } from '../wizard/donation-wizard';

type Props = {
	children: ReactNode;
};

export const DonationModalProvider = ({ children }: Props) => {
	const [state, send] = useMachine(donationWizardMachine);
	const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });

	const isOpen = !state.matches('closed');
	const isThankYou = state.matches('stepThankYou');
	const isOnboardingPersonal = state.matches('stepOnboardingPersonal');
	const isOnboardingReferral = state.matches('stepOnboardingReferral');
	const isPostCheckoutStep = isThankYou || isOnboardingPersonal || isOnboardingReferral;
	const isNarrowModal = isThankYou;
	const campaignId = state.context.campaignId;
	const showCurrencySelector =
		state.matches('stepAmount') || state.matches('stepPlanMonthly') || state.matches('stepPlanOneTime');
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

	const closeWizard = () => {
		setCloseConfirmOpen(false);
		send({ type: 'CLOSE' });
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
		<DonationModalContext.Provider value={{ openWizardAtAmountStep, openWizardWithFormAmount }}>
			{children}

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
								<div className="flex min-h-9 items-center justify-between gap-2 sm:gap-3">
									<DialogTitle size="lg">{t('modal.title')}</DialogTitle>
									{showCurrencySelector ? (
										<div className="w-20 shrink-0">
											<DonationCurrencySelector currencies={websiteCurrencies} />
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
