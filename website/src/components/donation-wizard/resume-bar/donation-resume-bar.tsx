'use client';

import { useCookieBannerHeight } from '@/components/analytics/cookie-banner-height';
import { trackEvent } from '@/lib/analytics/analytics';
import { useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { Button } from '@socialincome/design-system/actions/button/button';
import { FloatingActionBar } from '@socialincome/design-system/overlays/floating-action-bar/floating-action-bar';
import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useDonationModal } from '../hooks/use-donation-modal';
import { getDonationDisplayAmount } from '../utils/donation-amount';
import { getDonationBarEventProperties } from '../wizard/donation-analytics';
import { useDonationFormInView } from './donation-form-visibility';
import { toWalletDonation, useResumableDonation } from './resumable-donation';
import { WalletButton } from './wallet-button';

// Counts one impression per donation, not one per scroll past a form or reopened wizard.
let lastShownDonation: string | null = null;

/** Offers to finish a donation whose wizard was closed before paying, on every page of the session. */
export const DonationResumeBar = () => {
	const t = useTranslations('donation-wizard');
	const websiteCurrency = useWebsiteCurrency();
	const { isOpen, resumeDonation, openWizardAfterPayment } = useDonationModal();
	const donation = useResumableDonation();
	// Two ways to pay must never compete on screen.
	const isFormInView = useDonationFormInView();
	// The cookie banner sits in the same corner, so the bar stacks above it while it is shown.
	const cookieBannerHeight = useCookieBannerHeight();
	// The donation Stripe reported Apple Pay or Google Pay for, so a new donation starts without a wallet.
	const [walletDonationKey, setWalletDonationKey] = useState<string | null>(null);

	const visible = donation !== null && !isOpen && !isFormInView;
	// What the bar shows and the wallet charges; resuming reopens `donation` as it was left.
	const walletDonation = donation ? toWalletDonation(donation) : null;
	// The donor may have switched currency inside the wizard, so the donation's own currency counts.
	const currency = walletDonation?.currency ?? websiteCurrency;
	const donationKey = walletDonation ? JSON.stringify(walletDonation) : null;
	const amount = walletDonation ? getDonationDisplayAmount(walletDonation) : 0;
	const cadence = walletDonation?.cadence ?? 'monthly';
	// The wizard always shows two decimals; the bar keeps whole amounts short.
	const amountLabel = `${currency} ${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;

	useEffect(() => {
		if (visible && donationKey !== lastShownDonation) {
			lastShownDonation = donationKey;
			trackEvent('sticky_bar_shown', getDonationBarEventProperties(amount, currency, cadence));
		}
	}, [visible, donationKey, amount, currency, cadence]);

	// The donation is stored while the wizard is still open, so the bar mounts hidden and still slides in.
	if (!donation || !walletDonation || !donationKey) {
		return null;
	}

	const trackingProperties = getDonationBarEventProperties(amount, currency, cadence);
	const hasWallet = walletDonationKey === donationKey;

	return (
		<FloatingActionBar
			label={t('resumeBar.label')}
			visible={visible}
			bottomOffset={cookieBannerHeight > 0 ? cookieBannerHeight + 8 : 0}
			title={amountLabel}
			subtitle={t(cadence === 'monthly' ? 'stepAmount.monthly' : 'stepAmount.one-time')}
			// Without a wallet, Continue already opens the wizard, so the summary stays plain text.
			icon={hasWallet ? <Pencil /> : undefined}
			summaryAction={
				hasWallet
					? {
							label: t('resumeBar.summary', { amount: amountLabel, cadence }),
							onClick: () => {
								trackEvent('sticky_bar_amount_click', trackingProperties);
								resumeDonation(donation);
							},
						}
					: undefined
			}
			action={
				<WalletButton
					// A different donation needs a new checkout session.
					key={donationKey}
					donation={walletDonation}
					currency={currency}
					active={visible}
					hasWallet={hasWallet}
					onWalletChange={(available) => setWalletDonationKey(available ? donationKey : null)}
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
						openWizardAfterPayment(walletDonation, sessionId);
					}}
				/>
			}
		/>
	);
};
