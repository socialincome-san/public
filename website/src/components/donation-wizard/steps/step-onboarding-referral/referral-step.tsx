'use client';

import { Button } from '@/components/button';
import { RadioCard } from '@/components/create-program-wizard/radio-card';
import { RadioCardGroup } from '@/components/create-program-wizard/radio-card-group';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { updateContributorReferralAfterWizardQrAction } from '@/lib/server-actions/qr-wizard-actions';
import { updateContributorReferralAfterWizardCheckoutAction } from '@/lib/server-actions/stripe-wizard-actions';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useOnboardingAmountLine } from '../../hooks/use-onboarding-amount-line';
import { OnboardingSkipFallback } from '../../shared/onboarding-skip-fallback';
import { OnboardingSuccessHeader } from '../../shared/onboarding-success-header';
import type { DonationWizardStepProps } from '../../wizard/types';
import {
	toContributorReferralSource,
	WIZARD_REFERRAL_OPTIONS,
	type WizardReferralOptionValue,
} from './wizard-referral-options';

export const ReferralStep = ({ state, send }: DonationWizardStepProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { wizardPaymentSource, stripeCheckoutSessionId, qrContributorReferenceId, qrDonor, completedDonationSummary } =
		state.context;
	const amountLine = useOnboardingAmountLine(completedDonationSummary);

	const [selectedReferral, setSelectedReferral] = useState<WizardReferralOptionValue | undefined>();
	const [submitting, setSubmitting] = useState(false);

	const hasStripeReferralContext = wizardPaymentSource === 'stripe' && Boolean(stripeCheckoutSessionId);
	const hasQrReferralContext = wizardPaymentSource === 'qr' && Boolean(qrContributorReferenceId) && Boolean(qrDonor);
	const hasReferralContext = hasStripeReferralContext || hasQrReferralContext;

	const onSubmit = async () => {
		if (!hasReferralContext || selectedReferral === undefined) {
			return;
		}

		setSubmitting(true);

		try {
			const referral = toContributorReferralSource(selectedReferral);

			if (hasStripeReferralContext && stripeCheckoutSessionId) {
				const result = await updateContributorReferralAfterWizardCheckoutAction({
					stripeCheckoutSessionId,
					referral,
				});

				if (!result.success) {
					toast.error(t('onboarding.referral.updateError'));
					setSubmitting(false);

					return;
				}

				send({ type: 'DONATION_ONBOARDING_REFERRAL_COMPLETE' });

				return;
			}

			if (hasQrReferralContext && qrContributorReferenceId && qrDonor) {
				const result = await updateContributorReferralAfterWizardQrAction({
					paymentReferenceId: qrContributorReferenceId,
					expectedEmail: qrDonor.email,
					referral,
				});

				if (!result.success) {
					toast.error(t('onboarding.referral.updateError'));
					setSubmitting(false);

					return;
				}

				send({ type: 'DONATION_ONBOARDING_REFERRAL_COMPLETE' });
			}
		} catch {
			toast.error(t('onboarding.referral.updateError'));
			setSubmitting(false);
		}
	};

	if (!hasReferralContext) {
		return (
			<OnboardingSkipFallback
				onContinue={() => send({ type: 'DONATION_ONBOARDING_SKIP_TO_THANK_YOU' })}
				label={t('onboarding.continue')}
			/>
		);
	}

	return (
		<div className="flex w-full flex-col gap-6 overflow-y-auto px-4 pt-6 pb-8 sm:px-9 sm:pt-6 sm:pb-11">
			<OnboardingSuccessHeader amountLine={amountLine} />

			<div className="bg-background border-border flex flex-col gap-5 overflow-hidden rounded-3xl border px-0 pt-5 pb-7">
				<div className="border-border border-b pb-2">
					<p className="text-foreground px-6 text-lg leading-normal font-medium">{t('onboarding.referral.cardTitle')}</p>

					<div className="border-border flex flex-col gap-6 border-t p-6">
						<p className="text-foreground text-base leading-none font-medium">{t('onboarding.referral.question')}</p>
						<RadioCardGroup
							value={selectedReferral}
							onChange={(value) => setSelectedReferral(value as WizardReferralOptionValue)}
							layout="wrap"
						>
							{WIZARD_REFERRAL_OPTIONS.map(({ value, labelKey }) => (
								<RadioCard
									key={value}
									value={value}
									checked={selectedReferral === value}
									label={
										<span className="text-foreground text-sm font-medium">
											{t(`onboarding.referral.options.${labelKey}`)}
										</span>
									}
								/>
							))}
						</RadioCardGroup>
					</div>
				</div>

				<div className="flex justify-end px-6">
					<Button type="button" disabled={selectedReferral === undefined || submitting} onClick={() => void onSubmit()}>
						{submitting ? t('onboarding.referral.submitting') : t('onboarding.referral.submit')}
					</Button>
				</div>
			</div>
		</div>
	);
};
