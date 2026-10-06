'use client';

import { useRouteTranslator } from '@/lib/i18n/use-route-translator';
import { COUNTRY_CODES } from '@/lib/types/country';
import { GENDER_OPTIONS } from '@/modules/contributors/contributor.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import { Combobox } from '@socialincome/design-system/forms/combo-box/combo-box';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@socialincome/design-system/forms/form/form';
import { Input } from '@socialincome/design-system/forms/input/input';
import { RadioCard, RadioCardGroup } from '@socialincome/design-system/forms/radio-card/radio-card';
import { LongHairIcon, ShortHairIcon } from '@socialincome/design-system/icons/custom-icons/custom-icons';
import { type UseFormReturn } from 'react-hook-form';
import { type OnboardingPersonalFields } from '../../utils/donation-wizard-validation';

const GENDER_WIZARD_OPTIONS: readonly { value: (typeof GENDER_OPTIONS)[number] }[] = [
	{ value: 'female' },
	{ value: 'male' },
	{ value: 'private' },
];

type OnboardingPersonalFormProps = {
	form: UseFormReturn<OnboardingPersonalFields>;
	onSubmit: (values: OnboardingPersonalFields) => void;
	canSubmit: boolean;
	submitting: boolean;
	isEmailLocked: boolean;
};

export const OnboardingPersonalForm = ({
	form,
	onSubmit,
	canSubmit,
	submitting,
	isEmailLocked,
}: OnboardingPersonalFormProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { t: tCommon } = useRouteTranslator({ namespace: 'common' });
	const { t: tCountries } = useRouteTranslator({ namespace: 'countries' });

	return (
		<Form {...form}>
			<form
				className="bg-background border-border flex flex-col gap-5 overflow-hidden rounded-3xl border px-0 pb-7"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<div className="border-border flex flex-col gap-6 border-b p-6 lg:flex-row lg:gap-6">
					<p className="text-foreground shrink-0 text-base leading-none font-medium lg:w-1/2">{t('onboarding.isThisYou')}</p>
					<div className="flex min-w-0 flex-1 flex-col gap-7">
						<FormField
							control={form.control}
							name="firstname"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('onboarding.firstName')}</FormLabel>
									<FormControl>
										<Input type="text" autoComplete="given-name" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="lastname"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('onboarding.lastName')}</FormLabel>
									<FormControl>
										<Input type="text" autoComplete="family-name" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('onboarding.email')}</FormLabel>
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
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="country"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('onboarding.country')}</FormLabel>
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
							<div className="min-w-0 flex-1">
								<FormItem>
									<FormControl>
										<RadioCardGroup value={field.value} onChange={field.onChange} layout="stack">
											{GENDER_WIZARD_OPTIONS.map(({ value }) => (
												<RadioCard
													key={value}
													value={value}
													checked={field.value === value}
													label={
														<span className="text-foreground flex items-center gap-2 text-sm font-medium">
															{value === 'male' ? <ShortHairIcon /> : null}
															{value === 'female' ? <LongHairIcon /> : null}
															{value === 'private' ? t('onboarding.genderOtherPrivate') : tCommon(`genders.${value}`)}
														</span>
													}
												/>
											))}
										</RadioCardGroup>
									</FormControl>
								</FormItem>
							</div>
						)}
					/>
				</div>

				<div className="flex justify-end px-6">
					<Button type="submit" data-testid="donation-wizard-onboarding-submit" disabled={submitting || !canSubmit}>
						{submitting ? t('onboarding.submitting') : t('onboarding.submit')}
					</Button>
				</div>
			</form>
		</Form>
	);
};
