'use client';

import { Button } from '@/components/button';
import { Combobox } from '@/components/combo-box';
import { RadioCard } from '@/components/create-program-wizard/radio-card';
import { RadioCardGroup } from '@/components/create-program-wizard/radio-card-group';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/form';
import { Input } from '@/components/input';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { COUNTRY_CODES } from '@/lib/types/country';
import { GENDER_OPTIONS } from '@/lib/types/user';
import { Mars, Venus, type LucideIcon } from 'lucide-react';
import { type UseFormReturn } from 'react-hook-form';
import { type OnboardingPersonalFields } from '../../utils/donation-wizard-validation';

const GENDER_WIZARD_OPTIONS: readonly {
	value: (typeof GENDER_OPTIONS)[number];
	icon?: LucideIcon;
}[] = [{ value: 'female', icon: Venus }, { value: 'male', icon: Mars }, { value: 'private' }];

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
								</FormItem>
							)}
						/>
					</div>
				</div>

				<div className="flex justify-end px-6">
					<Button type="submit" disabled={submitting || !canSubmit}>
						{submitting ? t('onboarding.submitting') : t('onboarding.submit')}
					</Button>
				</div>
			</form>
		</Form>
	);
};
