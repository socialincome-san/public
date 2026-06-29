'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/dialog';
import { DonationCurrencySelector } from '@/components/donation/currency-selector';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { websiteCurrencies } from '@/lib/i18n/utils';
import { cn } from '@/lib/utils/cn';
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
					hasGradient
					closeOnClickOutside={false}
					closeOnEscape={false}
					onCloseClick={requestClose}
					data-testid="donation-wizard-modal"
					className={cn(
						'!flex flex-col gap-0 overflow-hidden overscroll-contain !p-0',
						isNarrowModal
							? 'sm:max-h-[90dvh] sm:min-h-[200px] sm:w-[min(474px,90vw)] sm:max-w-[474px]'
							: 'sm:max-h-[90dvh] sm:w-[min(890px,90vw)] sm:max-w-[890px]',
					)}
				>
					{isPostCheckoutStep ? (
						<>
							<DialogTitle className="sr-only">
								{isThankYou ? t('thankYou.message') : t('onboarding.successTitle')}
							</DialogTitle>
							<div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
								<DonationSteps state={state} send={send} />
							</div>
						</>
					) : (
						<>
							<div className="flex shrink-0 items-start gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] pr-14 pb-4 sm:gap-3 sm:px-6 sm:pt-6 sm:pr-20 sm:pb-6 md:pl-9">
								<div className="min-w-0 flex-1">
									<DialogTitle className="text-xl leading-tight font-medium text-pretty sm:text-2xl sm:leading-none">
										{t('modal.title')}
									</DialogTitle>
									{campaignId && campaignTitle ? (
										<p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-snug font-normal">
											{t('modal.campaign-for', { title: campaignTitle })}
										</p>
									) : null}
								</div>
								{showCurrencySelector ? (
									<DonationCurrencySelector
										currencies={websiteCurrencies}
										className="border-input h-9 w-[4.75rem] shrink-0 rounded-full px-2.5"
									/>
								) : null}
							</div>
							<DonationWizard state={state} send={send} />
						</>
					)}
				</DialogContent>
			</Dialog>

			<Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
				<DialogContent className="z-[120] gap-4 sm:max-w-[400px]" overlayClassName="z-[120]">
					<DialogTitle className="text-lg font-medium">{t('modal.closeConfirm.title')}</DialogTitle>
					<p className="text-muted-foreground text-sm leading-normal">{t('modal.closeConfirm.description')}</p>
					<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<Button type="button" variant="outline" onClick={() => setCloseConfirmOpen(false)}>
							{t('modal.closeConfirm.cancel')}
						</Button>
						<Button type="button" variant="destructive" onClick={confirmClose}>
							{t('modal.closeConfirm.confirm')}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</DonationModalContext.Provider>
	);
};
