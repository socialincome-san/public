'use client';

import { Button } from '@/components/button';
import { Combobox } from '@/components/combo-box';
import { RadioCard } from '@/components/create-program-wizard/radio-card';
import { RadioCardGroup } from '@/components/create-program-wizard/radio-card-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form';
import { Input } from '@/components/input';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { subscribeToNewsletterAction } from '@/lib/server-actions/newsletter-actions';
import {
	getStripeCheckoutOnboardingPrefillAction,
	updateContributorAfterWizardCheckoutAction,
} from '@/lib/server-actions/stripe-wizard-actions';
import { type SupportedLanguage } from '@/lib/services/sendgrid/types';
import { COUNTRY_CODES } from '@/lib/types/country';
import { GENDER_OPTIONS } from '@/lib/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mars, Venus, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';
import { OnboardingSuccessHeader, useOnboardingAmountLine } from '../../shared/onboarding-success-header';
import type { DonationWizardStepProps } from '../../wizard/types';

const GENDER_WIZARD_OPTIONS: readonly {
	value: (typeof GENDER_OPTIONS)[number];
	icon?: LucideIcon;
}[] = [{ value: 'female', icon: Venus }, { value: 'male', icon: Mars }, { value: 'private' }];

export const OnboardingStep = ({ state, send }: DonationWizardStepProps) => {
	const { t, language } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { t: tCommon } = useRouteTranslator({ namespace: 'common' });
	const { t: tCountries } = useRouteTranslator({ namespace: 'countries' });
	const { stripeCheckoutSessionId, completedDonationSummary } = state.context;
	const amountLine = useOnboardingAmountLine(completedDonationSummary);

	const [prefillStatus, setPrefillStatus] = useState<'loading' | 'ready' | 'error'>('loading');
	const [emailFromStripe, setEmailFromStripe] = useState<string | undefined>();
	const [submitting, setSubmitting] = useState(false);

	const [firstCountry, ...restCountries] = COUNTRY_CODES;
	const formSchema = z.object({
		firstname: z.string().trim().min(1),
		lastname: z.string().trim().min(1),
		email: z.string().email(),
		country: z.enum([firstCountry, ...restCountries]),
		gender: z.enum(GENDER_OPTIONS).optional(),
	});

	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstname: '',
			lastname: '',
			email: '',
		},
	});

	useEffect(() => {
		if (!stripeCheckoutSessionId) {
			return;
		}

		let cancelled = false;

		const loadPrefill = async () => {
			const result = await getStripeCheckoutOnboardingPrefillAction(stripeCheckoutSessionId);

			if (cancelled) {
				return;
			}

			if (!result.success) {
				setPrefillStatus('error');

				return;
			}

			if (!result.data.needsOnboarding) {
				send({ type: 'DONATION_ONBOARDING_SKIP_TO_THANK_YOU' });

				return;
			}

			setEmailFromStripe(result.data.email);
			form.reset({
				firstname: result.data.firstname ?? '',
				lastname: result.data.lastname ?? '',
				email: result.data.email ?? '',
				country: result.data.country,
			});
			setPrefillStatus('ready');
		};

		void loadPrefill();

		return () => {
			cancelled = true;
		};
	}, [form, send, stripeCheckoutSessionId]);

	const onSubmit = async (values: FormSchema) => {
		if (!stripeCheckoutSessionId) {
			return;
		}

		setSubmitting(true);

		try {
			const result = await updateContributorAfterWizardCheckoutAction({
				stripeCheckoutSessionId,
				user: {
					email: values.email,
					language,
					personal: {
						name: values.firstname,
						lastname: values.lastname,
						gender: values.gender,
					},
					address: {
						country: values.country,
					},
				},
			});

			await subscribeToNewsletterAction({
				firstname: values.firstname,
				lastname: values.lastname,
				email: values.email,
				language: language as SupportedLanguage,
			});

			if (!result.success) {
				toast.error(t('onboarding.updateError'));
				setSubmitting(false);

				return;
			}

			send({ type: 'DONATION_ONBOARDING_PERSONAL_COMPLETE' });
		} catch {
			toast.error(t('onboarding.updateError'));
			setSubmitting(false);
		}
	};

	const isEmailLocked = Boolean(emailFromStripe);

	if (!stripeCheckoutSessionId) {
		return (
			<div className="flex min-h-[200px] flex-col items-center justify-center gap-4 px-6 py-10">
				<p className="text-destructive text-sm">{t('onboarding.updateError')}</p>
				<Button type="button" onClick={() => send({ type: 'DONATION_ONBOARDING_SKIP_TO_THANK_YOU' })}>
					{t('onboarding.continue')}
				</Button>
			</div>
		);
	}

	if (prefillStatus === 'loading') {
		return (
			<div className="flex min-h-[320px] items-center justify-center px-6 py-12">
				<p className="text-muted-foreground text-sm">{t('onboarding.loading')}</p>
			</div>
		);
	}

	if (prefillStatus === 'error') {
		return (
			<div className="flex min-h-[200px] flex-col items-center justify-center gap-4 px-6 py-10">
				<p className="text-destructive text-sm">{t('onboarding.updateError')}</p>
				<Button type="button" onClick={() => send({ type: 'DONATION_ONBOARDING_SKIP_TO_THANK_YOU' })}>
					{t('onboarding.continue')}
				</Button>
			</div>
		);
	}

	return (
		<div className="flex w-full flex-col gap-6 overflow-y-auto px-4 pt-6 pb-8 sm:px-9 sm:pt-6 sm:pb-11">
			<OnboardingSuccessHeader amountLine={amountLine} />

			<Form {...form}>
				<form
					id="donation-onboarding-form"
					className="bg-background border-border flex flex-col gap-5 overflow-hidden rounded-3xl border px-0 pt-5 pb-7"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="border-border border-b pb-2">
						<p className="text-foreground px-6 text-lg leading-normal font-medium">{t('onboarding.accountCardTitle')}</p>

						<div className="border-border flex flex-col gap-6 border-t border-b p-6 lg:flex-row lg:gap-6">
							<p className="text-foreground shrink-0 text-base leading-none font-medium lg:w-1/2">
								{t('onboarding.isThisYou')}
							</p>
							<div className="flex min-w-0 flex-1 flex-col gap-7">
								<FormField
									control={form.control}
									name="firstname"
									render={({ field }) => (
										<FormItem className="gap-2">
											<FormLabel className="text-sm font-medium">{t('onboarding.firstName')}</FormLabel>
											<FormControl>
												<Input type="text" autoComplete="given-name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="lastname"
									render={({ field }) => (
										<FormItem className="gap-2">
											<FormLabel className="text-sm font-medium">{t('onboarding.lastName')}</FormLabel>
											<FormControl>
												<Input type="text" autoComplete="family-name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem className="gap-2">
											<FormLabel className="text-sm font-medium">{t('onboarding.email')}</FormLabel>
											<FormControl>
												<Input
													type="email"
													autoComplete="email"
													readOnly={isEmailLocked}
													disabled={isEmailLocked}
													aria-disabled={isEmailLocked}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="country"
									render={({ field }) => (
										<FormItem className="gap-2">
											<FormLabel className="text-sm font-medium">{t('onboarding.country')}</FormLabel>
											<FormControl>
												<Combobox
													options={COUNTRY_CODES.map((countryCode) => ({
														id: countryCode,
														label: tCountries(countryCode),
													}))}
													value={field.value}
													onChange={field.onChange}
													placeholder={t('onboarding.country')}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-6 p-6 lg:flex-row lg:gap-6">
							<div className="flex shrink-0 flex-col gap-2 lg:w-1/2">
								<p className="text-foreground text-base leading-none font-medium">{t('onboarding.genderSectionTitle')}</p>
								<p className="text-muted-foreground text-sm leading-normal">{t('onboarding.genderSectionDescription')}</p>
							</div>
							<FormField
								control={form.control}
								name="gender"
								render={({ field }) => (
									<FormItem className="flex min-w-0 flex-1 flex-col gap-3">
										<FormControl>
											<RadioCardGroup value={field.value} onChange={field.onChange} layout="stack">
												{GENDER_WIZARD_OPTIONS.map(({ value, icon: Icon }) => (
													<RadioCard
														key={value}
														value={value}
														checked={field.value === value}
														label={
															<span className="text-foreground flex items-center gap-2 text-sm font-medium">
																{Icon ? <Icon className="size-5 shrink-0" strokeWidth={1.5} aria-hidden /> : null}
																{value === 'private' ? t('onboarding.genderOtherPrivate') : tCommon(`genders.${value}`)}
															</span>
														}
													/>
												))}
											</RadioCardGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					<div className="flex justify-end px-6">
						<Button type="submit" disabled={submitting}>
							{submitting ? t('onboarding.submitting') : t('onboarding.submit')}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
};
