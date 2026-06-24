'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { subscribeToNewsletterAction } from '@/lib/server-actions/newsletter-actions';
import { getQrOnboardingPrefillAction, updateContributorAfterWizardQrAction } from '@/lib/server-actions/qr-wizard-actions';
import {
	getStripeCheckoutOnboardingPrefillAction,
	updateContributorAfterWizardCheckoutAction,
} from '@/lib/server-actions/stripe-wizard-actions';
import { type SupportedLanguage } from '@/lib/services/sendgrid/types';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useOnboardingAmountLine } from '../../hooks/use-onboarding-amount-line';
import { OnboardingSkipFallback } from '../../shared/onboarding-skip-fallback';
import { OnboardingSuccessHeader } from '../../shared/onboarding-success-header';
import { isOnboardingPersonalValid, type OnboardingPersonalFields } from '../../utils/donation-wizard-validation';
import type { DonationWizardStepProps } from '../../wizard/types';
import { OnboardingPersonalForm } from './onboarding-personal-form';

export const OnboardingStep = ({ state, send }: DonationWizardStepProps) => {
	const { t, language } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { wizardPaymentSource, stripeCheckoutSessionId, qrContributorReferenceId, qrDonor, completedDonationSummary } =
		state.context;
	const amountLine = useOnboardingAmountLine(completedDonationSummary);

	const [prefillStatus, setPrefillStatus] = useState<'loading' | 'ready' | 'error'>('loading');
	const [emailLocked, setEmailLocked] = useState<string | undefined>();
	const [submitting, setSubmitting] = useState(false);

	const form = useForm<OnboardingPersonalFields>({
		defaultValues: {
			firstname: '',
			lastname: '',
			email: '',
			country: 'CH',
		},
	});

	const values = useWatch({ control: form.control });
	const canSubmit = isOnboardingPersonalValid(values ?? {});
	const skipToThankYou = () => send({ type: 'DONATION_ONBOARDING_SKIP_TO_THANK_YOU', email: emailLocked });

	const hasStripeOnboardingContext = wizardPaymentSource === 'stripe' && Boolean(stripeCheckoutSessionId);
	const hasQrOnboardingContext = wizardPaymentSource === 'qr' && Boolean(qrContributorReferenceId);
	const hasOnboardingContext = hasStripeOnboardingContext || hasQrOnboardingContext;

	useEffect(() => {
		if (!hasOnboardingContext) {
			return;
		}

		let cancelled = false;

		const loadPrefill = async () => {
			const result =
				hasStripeOnboardingContext && stripeCheckoutSessionId
					? await getStripeCheckoutOnboardingPrefillAction(stripeCheckoutSessionId)
					: hasQrOnboardingContext && qrContributorReferenceId && qrDonor
						? await getQrOnboardingPrefillAction({
								paymentReferenceId: qrContributorReferenceId,
								expectedEmail: qrDonor.email,
							})
						: null;

			if (cancelled) {
				return;
			}

			if (!result?.success) {
				setPrefillStatus('error');

				return;
			}

			if (!result.data.needsOnboarding) {
				send({ type: 'DONATION_ONBOARDING_SKIP_TO_THANK_YOU', email: result.data.email });

				return;
			}

			const lockedEmail = hasQrOnboardingContext ? (qrDonor?.email ?? result.data.email) : result.data.email;
			setEmailLocked(lockedEmail);
			form.reset({
				firstname: result.data.firstname ?? qrDonor?.firstName ?? '',
				lastname: result.data.lastname ?? qrDonor?.lastName ?? '',
				email: lockedEmail ?? '',
				country: result.data.country ?? 'CH',
			});
			setPrefillStatus('ready');
		};

		void loadPrefill();

		return () => {
			cancelled = true;
		};
	}, [
		form,
		hasOnboardingContext,
		hasQrOnboardingContext,
		hasStripeOnboardingContext,
		qrContributorReferenceId,
		qrDonor,
		send,
		stripeCheckoutSessionId,
	]);

	const onSubmit = async (submitted: OnboardingPersonalFields) => {
		if (!isOnboardingPersonalValid(submitted)) {
			return;
		}

		if (wizardPaymentSource === 'stripe' && stripeCheckoutSessionId) {
			setSubmitting(true);

			try {
				const result = await updateContributorAfterWizardCheckoutAction({
					stripeCheckoutSessionId,
					user: {
						email: submitted.email,
						language,
						personal: {
							name: submitted.firstname,
							lastname: submitted.lastname,
							gender: submitted.gender,
						},
						address: {
							country: submitted.country,
						},
					},
				});

				if (!result.success) {
					toast.error(t('onboarding.updateError'));
					setSubmitting(false);

					return;
				}

				await subscribeToNewsletterAction({
					firstname: submitted.firstname,
					lastname: submitted.lastname,
					email: submitted.email,
					language: language as SupportedLanguage,
				});

				send({ type: 'DONATION_ONBOARDING_PERSONAL_COMPLETE', email: submitted.email });
			} catch {
				toast.error(t('onboarding.updateError'));
				setSubmitting(false);
			}

			return;
		}

		if (wizardPaymentSource === 'qr' && qrContributorReferenceId && qrDonor) {
			setSubmitting(true);

			try {
				const result = await updateContributorAfterWizardQrAction({
					paymentReferenceId: qrContributorReferenceId,
					expectedEmail: qrDonor.email,
					user: {
						language,
						personal: {
							name: submitted.firstname,
							lastname: submitted.lastname,
							gender: submitted.gender,
						},
						address: {
							country: submitted.country,
						},
					},
				});

				if (!result.success) {
					toast.error(t('onboarding.updateError'));
					setSubmitting(false);

					return;
				}

				await subscribeToNewsletterAction({
					firstname: submitted.firstname,
					lastname: submitted.lastname,
					email: submitted.email,
					language: language as SupportedLanguage,
				});

				send({ type: 'DONATION_ONBOARDING_PERSONAL_COMPLETE', email: submitted.email });
			} catch {
				toast.error(t('onboarding.updateError'));
				setSubmitting(false);
			}
		}
	};

	const isEmailLocked = Boolean(emailLocked);

	if (!hasOnboardingContext) {
		return <OnboardingSkipFallback onContinue={skipToThankYou} label={t('onboarding.continue')} />;
	}

	if (prefillStatus === 'loading') {
		return (
			<div className="flex min-h-[320px] items-center justify-center px-6 py-12">
				<p className="text-muted-foreground text-sm">{t('onboarding.loading')}</p>
			</div>
		);
	}

	if (prefillStatus === 'error') {
		return <OnboardingSkipFallback onContinue={skipToThankYou} label={t('onboarding.continue')} />;
	}

	return (
		<div
			className="flex w-full flex-col gap-6 px-4 pt-6 pb-8 sm:px-9 sm:pt-6 sm:pb-11"
			data-testid="donation-wizard-step-onboarding"
		>
			<OnboardingSuccessHeader amountLine={amountLine} />
			<OnboardingPersonalForm
				form={form}
				onSubmit={onSubmit}
				canSubmit={canSubmit}
				submitting={submitting}
				isEmailLocked={isEmailLocked}
			/>
		</div>
	);
};
