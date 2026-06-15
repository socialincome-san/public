'use client';

import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/form';
import { Input } from '@/components/input';
import { useContributorSession } from '@/lib/firebase/hooks/useContributorSession';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { cn } from '@/lib/utils/cn';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getDonationWizardCardClass } from '../../utils/donation-wizard-layout';
import { isQrContactValid, type QrContactFields } from '../../utils/donation-wizard-validation';
import type { DonationWizardStepProps } from '../../wizard/types';
import { QrWizardStepFooter } from './qr-wizard-step-footer';
import { requestQrBillGeneration } from './request-qr-bill-generation';

export const QrContactStep = ({ state, send }: DonationWizardStepProps) => {
	const { t, language } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { currency = 'CHF' } = useI18n();
	const { contributorSession } = useContributorSession();
	const isLoading = state.context.qrBillStatus === 'loading';
	const canGoBack = state.context.qrContributorReferenceId === null;

	const form = useForm<QrContactFields>({
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
		},
	});

	const values = useWatch({ control: form.control });
	const canSubmit = isQrContactValid({
		firstName: values?.firstName ?? '',
		lastName: values?.lastName ?? '',
		email: values?.email ?? '',
	});

	useEffect(() => {
		if (!contributorSession) {
			return;
		}
		form.setValue('email', contributorSession.email ?? '');
		form.setValue('firstName', contributorSession.firstName ?? '');
		form.setValue('lastName', contributorSession.lastName ?? '');
	}, [contributorSession, form]);

	const titleKey = state.context.cadence === 'monthly' ? 'stepQrContact.titleStandingOrder' : 'stepQrContact.titleOneTime';

	const onSubmit = (submitted: QrContactFields) => {
		if (!isQrContactValid(submitted)) {
			return;
		}

		void requestQrBillGeneration({
			context: state.context,
			donor: {
				...submitted,
				language,
			},
			send,
			currency,
		});
	};

	useEffect(() => {
		if (state.context.qrBillStatus !== 'error' || !state.context.qrBillError) {
			return;
		}
		toast.error(t('stepQrContact.generateError'));
	}, [state.context.qrBillError, state.context.qrBillStatus, t]);

	return (
		<div
			className={cn(getDonationWizardCardClass('stepQrContact'), 'text-foreground flex w-full flex-col gap-5')}
			data-testid="donation-wizard-step-qr-contact"
		>
			<h3 className="text-lg leading-7 font-medium">{t(titleKey)}</h3>

			<Form {...form}>
				<form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex w-full flex-col gap-5">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem className="w-full gap-2">
									<FormLabel className="text-sm font-medium">{t('stepQrContact.firstName')}</FormLabel>
									<FormControl>
										<Input {...field} autoComplete="given-name" disabled={isLoading} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="lastName"
							render={({ field }) => (
								<FormItem className="w-full gap-2">
									<FormLabel className="text-sm font-medium">{t('stepQrContact.lastName')}</FormLabel>
									<FormControl>
										<Input {...field} autoComplete="family-name" disabled={isLoading} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="w-full gap-2">
									<FormLabel className="text-sm font-medium">{t('stepQrContact.email')}</FormLabel>
									<FormControl>
										<Input {...field} type="email" autoComplete="email" disabled={isLoading} />
									</FormControl>
								</FormItem>
							)}
						/>
					</div>

					<QrWizardStepFooter
						showBack={canGoBack}
						onBack={canGoBack ? () => send({ type: 'BACK' }) : undefined}
						onContinue={() => void form.handleSubmit(onSubmit)()}
						continueLabel={isLoading ? t('stepQrContact.generating') : t('stepQrContact.generateCta')}
						continueDisabled={isLoading || !canSubmit}
						continueTestId="donation-wizard-qr-generate"
					/>
				</form>
			</Form>
		</div>
	);
};
