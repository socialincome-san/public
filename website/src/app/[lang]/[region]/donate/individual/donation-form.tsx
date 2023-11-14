'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { CreatePaymentData } from '@/app/api/stripe/checkout/new-payment/route';
import { useI18n } from '@/app/context-providers';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { useTranslator } from '@/hooks/useTranslator';
import { websiteCurrencies, WebsiteLanguage } from '@/i18n';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Button,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
	Input,
	RadioGroup,
	Typography,
} from '@socialincome/ui';
import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { useUser } from 'reactfire';
import Stripe from 'stripe';
import * as z from 'zod';

const DONATION_INTERVALS = ['1', '3', '12'] as const;
type DonationInterval = (typeof DONATION_INTERVALS)[number];

const getTextOption = (amount: number) => {
	const thresholds = [10, 15, 30, 60, 90, 120, 150, 300, Infinity];
	const index = thresholds.findIndex((threshold) => amount < threshold);
	return index === -1 ? 0 : index;
};

const getDonationAmount = (amount: number, donationInterval: DonationInterval) => {
	return amount * 0.01 * Number(donationInterval);
};

type DonationImpactTranslations = {
	yourMonthlyContribution: string;
	directPayout: string;
	yourImpact: string;
};

type DonationImpactProps = {
	lang: WebsiteLanguage;
	translations: DonationImpactTranslations;
};

function DonationImpact({ lang, translations }: DonationImpactProps) {
	const amount = useWatch({ name: 'monthlyIncome' }) * 0.01;
	const translator = useTranslator(lang, 'website-donate');
	const { currency } = useI18n();
	const textOption = getTextOption(amount);

	return (
		<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
			<div className="space-y-2">
				<Typography size="lg" weight="semibold">
					{translations.yourMonthlyContribution}
				</Typography>
				<Typography size="xl" weight="bold">
					{translator?.t('amount-currency', {
						context: { amount: amount, currency: currency, locale: lang },
					})}
				</Typography>
				<Typography size="md">{translations.directPayout}</Typography>
			</div>
			<div className="space-y-2">
				<Typography size="lg" weight="semibold">
					{translations.yourImpact}
				</Typography>
				<Typography>
					{translator?.t(`donation-impact.${textOption}`, {
						context: { amount: amount, currency: currency, locale: lang },
					})}
				</Typography>
			</div>
		</div>
	);
}

type RadioGroupFormItemProps = {
	active: boolean;
	donationInterval: DonationInterval;
	title: string;
	lang: WebsiteLanguage;
};

function RadioGroupFormItem({ active, title, donationInterval, lang }: RadioGroupFormItemProps) {
	const monthlyIncome = useWatch({ name: 'monthlyIncome' });
	const translator = useTranslator(lang, 'website-donate');
	const { currency } = useI18n();
	const [previewAmount, setPreviewAmount] = useState(getDonationAmount(monthlyIncome, donationInterval));
	const { setValue } = useFormContext<{ donationInterval: DonationInterval }>();

	useEffect(() => {
		setPreviewAmount(getDonationAmount(monthlyIncome, donationInterval));
	}, [monthlyIncome]);

	return (
		<FormItem>
			<FormControl
				className={classNames(
					'flex h-full flex-1 cursor-pointer flex-row rounded-lg border-2 p-4 shadow-sm focus:outline-none',
					{ 'border-si-yellow': active },
				)}
			>
				<div onClick={() => setValue('donationInterval', donationInterval)}>
					<div className="flex flex-1">
						<div className="flex flex-col space-y-1">
							<Typography weight="bold">{title}</Typography>
							<Typography size="sm">
								{translator?.t(`donation-interval.${donationInterval}.text`, {
									context: { amount: previewAmount, currency: currency, locale: lang },
								})}
							</Typography>
						</div>
					</div>
					<CheckCircleIcon
						className={classNames(!active ? 'invisible' : '', 'text-si-yellow h-5 w-5')}
						aria-hidden="true"
					/>
				</div>
			</FormControl>
		</FormItem>
	);
}

type DonationFormProps = {
	amount?: number;
	translations: {
		title: string;
		amount: string;
		howToPay: string;
		buttonText: string;
		donationImpact: DonationImpactTranslations;
	};
} & DefaultParams;

export function DonationForm({ amount, translations, lang, region }: DonationFormProps) {
	const router = useRouter();
	const { data: authUser } = useUser();
	const { currency } = useI18n();

	const formSchema = z.object({
		monthlyIncome: z.coerce.number(),
		donationInterval: z.enum(DONATION_INTERVALS),
	});
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { donationInterval: '1', monthlyIncome: amount || ('' as any) },
	});

	const onSubmit = async (values: FormSchema) => {
		const authToken = await authUser?.getIdToken(true);
		const data: CreatePaymentData = {
			amount: getDonationAmount(values.monthlyIncome, values.donationInterval) * 100, // The amount is in cents, so we need to multiply by 100 to get the correct amount.
			intervalCount: Number(values.donationInterval),
			currency: currency,
			successUrl: `${window.location.origin}/${lang}/${region}/donate/success?stripeCheckoutSessionId={CHECKOUT_SESSION_ID}`,
			recurring: true,
			firebaseAuthToken: authToken,
		};
		const response = await fetch('/api/stripe/checkout/new-payment', {
			method: 'POST',
			body: JSON.stringify(data),
		});
		const { url } = (await response.json()) as Stripe.Response<Stripe.Checkout.Session>;
		// This sends the user to stripe.com where payment is completed
		if (url) router.push(url);
	};

	return (
		<div className="flex flex-col">
			<Typography weight="bold" size="3xl" className="mb-12 text-center">
				{translations.title}
			</Typography>
			<Form {...form}>
				<form className="flex flex-col space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
					<div className="mb-2 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 md:items-center">
						<FormField
							control={form.control}
							name="monthlyIncome"
							render={({ field }) => (
								<FormItem className="flex-1">
									<FormControl>
										<Input className="h-16 text-lg" placeholder={translations.amount} {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<CurrencySelector className="h-16 w-full sm:flex-1" currencies={websiteCurrencies} fontSize="lg" />
					</div>
					{form.watch('monthlyIncome') > 0 && (
						<Card>
							<CardHeader>
								<DonationImpact lang={lang} translations={translations.donationImpact} />
							</CardHeader>
							<CardContent className="mt-8">
								<Typography size="lg" weight="semibold" className="mb-4">
									{translations.howToPay}
								</Typography>
								<FormField
									control={form.control}
									name="donationInterval"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormControl>
												<RadioGroup
													onValueChange={field.onChange}
													defaultValue={field.value}
													className="grid grid-cols-1 place-items-stretch gap-4 md:grid-cols-3"
												>
													<RadioGroupFormItem
														active={field.value === '1'}
														donationInterval="1"
														title="Monthly"
														lang={lang}
													/>
													<RadioGroupFormItem
														active={field.value === '3'}
														donationInterval="3"
														title="Quarterly"
														lang={lang}
													/>
													<RadioGroupFormItem
														active={field.value === '12'}
														donationInterval="12"
														title="Yearly"
														lang={lang}
													/>
												</RadioGroup>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
							<CardFooter>
								<Button size="lg" type="submit" className="w-full">
									{translations.buttonText}
								</Button>
							</CardFooter>
						</Card>
					)}
				</form>
			</Form>
		</div>
	);
}
