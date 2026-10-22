'use client';

import { trackEvent, useCookieBannerOpen } from '@/lib/analytics/analytics';
import { useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { Button } from '@socialincome/design-system/actions/button/button';
import { FloatingActionBar } from '@socialincome/design-system/overlays/floating-action-bar/floating-action-bar';
import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useDonationModal } from '../hooks/use-donation-modal';
import { getDonationDisplayAmount } from '../utils/donation-amount';
import { getDonationBarEventProperties } from '../wizard/donation-analytics';
import { useDonationFormInView } from './donation-form-visibility';
import { useResumableDonation } from './resumable-donation';
import { WalletButton } from './wallet-button';

// Counts one impression per donation, not one per scroll past a form or reopened wizard.
let lastShownDonation: string | null = null;

/** Offers to finish a donation whose wizard was closed before paying, on every page of the session. */
export const DonationResumeBar = () => {
	const t = useTranslations('donation-wizard');
	const currency = useWebsiteCurrency();
	const { isOpen, resumeDonation, openWizardAfterPayment } = useDonationModal();
	const donation = useResumableDonation();
	// Two ways to pay must never compete on screen.
	const isFormInView = useDonationFormInView();
	// The cookie banner sits in the same corner and comes first.
	const isCookieBannerOpen = useCookieBannerOpen();

	const visible = donation !== null && !isOpen && !isFormInView && !isCookieBannerOpen;
	const donationKey = donation ? `${currency}:${JSON.stringify(donation)}` : null;
	const amount = donation ? getDonationDisplayAmount(donation) : 0;
	const cadence = donation?.cadence ?? 'monthly';
	// The wizard always shows two decimals; the bar keeps whole amounts short.
	const amountLabel = `${currency} ${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;

	useEffect(() => {
		if (visible && donationKey !== lastShownDonation) {
			lastShownDonation = donationKey;
			trackEvent('sticky_bar_shown', getDonationBarEventProperties(amount, currency, cadence));
		}
	}, [visible, donationKey, amount, currency, cadence]);

	// The donation is stored while the wizard is still open, so the bar mounts hidden and still slides in.
	if (!donation || !donationKey) {
		return null;
	}

	const trackingProperties = getDonationBarEventProperties(amount, currency, cadence);

	return (
		<FloatingActionBar
			label={t('resumeBar.label')}
			visible={visible}
			title={amountLabel}
			subtitle={t(cadence === 'monthly' ? 'stepAmount.monthly' : 'stepAmount.one-time')}
			icon={<Pencil />}
			summaryLabel={t('resumeBar.summary', { amount: amountLabel, cadence })}
			onSummaryClick={() => {
				trackEvent('sticky_bar_amount_click', trackingProperties);
				resumeDonation(donation);
			}}
			action={
				<WalletButton
					// A different donation or currency needs a new checkout session.
					key={donationKey}
					donation={donation}
					currency={currency}
					active={visible}
					fallback={
						<Button
							size="md"
							fullWidth
							onClick={() => {
								trackEvent('sticky_bar_continue_click', trackingProperties);
								resumeDonation(donation);
							}}
						>
							{t('resumeBar.continue')}
						</Button>
					}
					onConfirm={(paymentMethod) =>
						trackEvent('sticky_bar_wallet_click', getDonationBarEventProperties(amount, currency, cadence, paymentMethod))
					}
					onPaid={(sessionId) => {
						trackEvent('sticky_bar_donation_complete', trackingProperties);
						openWizardAfterPayment(donation, sessionId);
					}}
				/>
			}
		/>
	);
};
