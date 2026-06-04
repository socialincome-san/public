'use client';

import { Button } from '@/components/button';
import { RadioCard } from '@/components/create-program-wizard/radio-card';
import { RadioCardGroup } from '@/components/create-program-wizard/radio-card-group';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { updateContributorReferralAfterWizardCheckoutAction } from '@/lib/server-actions/stripe-wizard-actions';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { OnboardingSuccessHeader, useOnboardingAmountLine } from '../../shared/onboarding-success-header';
import type { DonationWizardStepProps } from '../../wizard/types';
import {
	toContributorReferralSource,
	WIZARD_REFERRAL_OPTIONS,
	type WizardReferralOptionValue,
} from './wizard-referral-options';

export const ReferralStep = ({ state, send }: DonationWizardStepProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { stripeCheckoutSessionId, completedDonationSummary } = state.context;
	const amountLine = useOnboardingAmountLine(completedDonationSummary);

	const [selectedReferral, setSelectedReferral] = useState<WizardReferralOptionValue | undefined>();
	const [submitting, setSubmitting] = useState(false);

	const onSubmit = async () => {
		if (!stripeCheckoutSessionId || selectedReferral === undefined) {
			return;
		}

		setSubmitting(true);

		try {
			const result = await updateContributorReferralAfterWizardCheckoutAction({
				stripeCheckoutSessionId,
				referral: toContributorReferralSource(selectedReferral),
			});

			if (!result.success) {
				toast.error(t('onboarding.referral.updateError'));
				setSubmitting(false);

				return;
			}

			send({ type: 'DONATION_ONBOARDING_REFERRAL_COMPLETE' });
		} catch {
			toast.error(t('onboarding.referral.updateError'));
			setSubmitting(false);
		}
	};

	if (!stripeCheckoutSessionId) {
		return (
			<div className="flex min-h-[200px] flex-col items-center justify-center gap-4 px-6 py-10">
				<p className="text-destructive text-sm">{t('onboarding.referral.updateError')}</p>
				<Button type="button" onClick={() => send({ type: 'DONATION_ONBOARDING_SKIP_TO_THANK_YOU' })}>
					{t('onboarding.continue')}
				</Button>
			</div>
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
