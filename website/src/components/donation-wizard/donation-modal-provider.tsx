'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/dialog';
import { DonationCurrencySelector } from '@/components/donation/currency-selector';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { websiteCurrencies } from '@/lib/i18n/utils';
import type { ContributorCommunityStats } from '@/lib/services/contributor/contributor.types';
import { cn } from '@/lib/utils/cn';
import { useMachine } from '@xstate/react';
import { useCallback, type ReactNode } from 'react';
import { useDonationCampaignTitle } from './hooks/use-donation-campaign-title';
import { DonationModalContext } from './hooks/use-donation-modal';
import { ThankYouStep } from './steps/thank-you/thank-you-step';
import type { DonationAmountContext } from './utils/donation-amount';
import { donationWizardMachine } from './wizard/donation-machine';
import { DonationWizard } from './wizard/donation-wizard';

type Props = {
	children: ReactNode;
	communityStats?: ContributorCommunityStats | null;
};

export const DonationModalProvider = ({ children, communityStats = null }: Props) => {
	const [state, send] = useMachine(donationWizardMachine);
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });

	const isOpen = !state.matches('closed');
	const isThankYou = state.value === 'stepThankYou';
	const campaignId = state.context.campaignId;
	const campaignTitle = useDonationCampaignTitle(campaignId, isOpen && !isThankYou);

	const openDonationWizard = useCallback(() => {
		send({ type: 'OPEN' });
	}, [send]);

	const openDonationWizardFromForm = useCallback(
		(context: DonationAmountContext) => {
			send({ type: 'OPEN_FROM_FORM', context });
		},
		[send],
	);

	return (
		<DonationModalContext.Provider value={{ openDonationWizard, openDonationWizardFromForm }}>
			{children}

			<Dialog
				open={isOpen}
				onOpenChange={(open) => {
					if (!open) {
						send({ type: 'CLOSE' });
					}
				}}
			>
				<DialogContent
					variant="gradient"
					fullscreenOnMobile
					className={cn(
						'!flex flex-col gap-0 overflow-hidden overscroll-contain !p-0',
						isThankYou
							? 'sm:max-h-[90dvh] sm:min-h-[200px] sm:w-[min(320px,90vw)] sm:max-w-[320px]'
							: 'sm:max-h-[90dvh] sm:w-[min(890px,90vw)] sm:max-w-[890px]',
					)}
				>
					{isThankYou ? (
						<>
							<DialogTitle className="sr-only">{t('thankYou.message')}</DialogTitle>
							<ThankYouStep />
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
								<DonationCurrencySelector
									currencies={websiteCurrencies}
									className="h-9 w-[4.75rem] shrink-0 rounded-full border-slate-300 px-2.5"
								/>
							</div>
							<DonationWizard state={state} send={send} communityStats={communityStats} />
						</>
					)}
				</DialogContent>
			</Dialog>
		</DonationModalContext.Provider>
	);
};
