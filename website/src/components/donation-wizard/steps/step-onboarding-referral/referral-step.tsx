'use client';

import { Button } from '@/components/button';
import { RadioGroup, RadioGroupItem } from '@/components/radio-group';
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
		<div
			className="flex w-full flex-col gap-6 px-4 pt-6 pb-8 sm:px-9 sm:pt-6 sm:pb-11"
			data-testid="donation-wizard-step-referral"
		>
			<OnboardingSuccessHeader amountLine={amountLine} showAccountCreatedDescription />

			<div className="bg-background border-border flex flex-col gap-5 overflow-hidden rounded-3xl border px-0 pt-5 pb-7">
				<div className="border-border border-b pb-2">
					<p className="text-foreground px-6 text-lg leading-normal font-medium">{t('onboarding.referral.cardTitle')}</p>

					<div className="border-border mt-4 grid gap-6 border-t p-6 sm:grid-cols-[minmax(0,1fr)_minmax(220px,1fr)]">
						<p className="text-foreground text-base leading-none font-medium">{t('onboarding.referral.question')}</p>
						<RadioGroup
							value={selectedReferral}
							onValueChange={(value) => setSelectedReferral(value as WizardReferralOptionValue)}
							className="gap-4"
						>
							{WIZARD_REFERRAL_OPTIONS.map(({ value, labelKey }) => {
								const optionId = `donation-wizard-referral-${value}`;

								return (
									<div key={value} className="flex items-center gap-3">
										<RadioGroupItem id={optionId} value={value} />
										<label htmlFor={optionId} className="text-foreground cursor-pointer text-sm font-medium">
											{t(`onboarding.referral.options.${labelKey}`)}
										</label>
									</div>
								);
							})}
						</RadioGroup>
					</div>
				</div>

				<div className="flex flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
					<Button
						type="button"
						data-testid="donation-wizard-referral-submit"
						className="sm:order-2"
						disabled={selectedReferral === undefined || submitting}
						onClick={() => void onSubmit()}
					>
						{submitting ? t('onboarding.referral.submitting') : t('onboarding.referral.submit')}
					</Button>
					<Button
						type="button"
						variant="outline"
						data-testid="donation-wizard-referral-skip"
						className="sm:order-1"
						disabled={submitting}
						onClick={() => send({ type: 'DONATION_ONBOARDING_SKIP_TO_THANK_YOU' })}
					>
						{t('onboarding.referral.skip')}
					</Button>
				</div>
			</div>
		</div>
	);
};
