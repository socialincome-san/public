'use client';

import { Button } from '@/components/button';
import { BankTransferForm, type BankTransferFormTranslations } from '@/components/donation/bank-transfer-form';
import { DonationCurrencySelector } from '@/components/donation/currency-selector';
import { Form, FormControl, FormField, FormItem } from '@/components/form';
import { Input } from '@/components/input';
import { useI18n } from '@/lib/i18n/useI18n';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { createStripeCheckoutAction } from '@/lib/server-actions/stripe-actions';
import { cn } from '@/lib/utils/cn';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';

const DonationInterval = {
	OneTime: 'one-time',
	Monthly: 'monthly',
} as const;

const PaymentTypes = {
	CREDIT_CARD: 'credit_card',
	BANK_TRANSFER: 'bank_transfer',
} as const;

type PaymentType = (typeof PaymentTypes)[keyof typeof PaymentTypes];

export type CampaignCheckoutTranslations = {
	title: string;
	oneTime: string;
	monthly: string;
	submit: string;
	feeNotice: string;
	paymentType: {
		bankTransfer: string;
		creditCard: string;
	};
	bankTransfer: BankTransferFormTranslations;
};

type Props = {
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	campaignId: string;
	translations: CampaignCheckoutTranslations;
	daysLeft: number;
	daysLeftLabel: string;
};

const monthlyAmounts = [10, 30, 100, 150, 200];
const oneTimeAmounts = [25, 50, 100, 500, 1000];

export const CampaignCheckoutForm = ({ lang, region, campaignId, translations, daysLeft, daysLeftLabel }: Props) => {
	const router = useRouter();
	const { currency } = useI18n();
	const [submitting, setSubmitting] = useState(false);

	const formSchema = z
		.object({
			interval: z.enum([DonationInterval.OneTime, DonationInterval.Monthly]),
			paymentType: z.enum([PaymentTypes.CREDIT_CARD, PaymentTypes.BANK_TRANSFER]).default(PaymentTypes.CREDIT_CARD),
			amount: z.coerce.number().min(1),
			email: z.string().optional(),
			firstName: z.string().optional(),
			lastName: z.string().optional(),
		})
		.superRefine((data, ctx) => {
			if (data.paymentType === PaymentTypes.BANK_TRANSFER) {
				if (!data.email) {
					ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'] });
				} else if (!z.string().email().safeParse(data.email).success) {
					ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'] });
				}
				if (!data.firstName) {
					ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['firstName'] });
				}
				if (!data.lastName) {
					ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['lastName'] });
				}
			}
		});

	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			interval: DonationInterval.Monthly,
			amount: 100,
			paymentType: PaymentTypes.CREDIT_CARD,
			email: '',
			firstName: '',
			lastName: '',
		},
	});

	const interval = useWatch({ control: form.control, name: 'interval' });
	const paymentType = useWatch({ control: form.control, name: 'paymentType' });
	const amount = useWatch({ control: form.control, name: 'amount' });
	const amountPresets = interval === DonationInterval.Monthly ? monthlyAmounts : oneTimeAmounts;
	const showBankTransfer = region === 'ch' && ['CHF', 'EUR'].includes(currency ?? '');
	const isBankTransfer = showBankTransfer && paymentType === PaymentTypes.BANK_TRANSFER;

	useEffect(() => {
		if (!showBankTransfer && paymentType === PaymentTypes.BANK_TRANSFER) {
			form.setValue('paymentType', PaymentTypes.CREDIT_CARD);
		}
	}, [showBankTransfer, paymentType, form]);

	const onSubmit = async (values: FormSchema) => {
		if (values.paymentType === PaymentTypes.BANK_TRANSFER) {
			return;
		}

		setSubmitting(true);

		try {
			const result = await createStripeCheckoutAction({
				amount: values.amount * 100,
				currency,
				successUrl: `${window.location.origin}/${lang}/${region}/donate/success/stripe/{CHECKOUT_SESSION_ID}`,
				recurring: values.interval === DonationInterval.Monthly,
				intervalCount: values.interval === DonationInterval.Monthly ? 1 : undefined,
				campaignId,
			});

			if (!result.success) {
				console.error(result.error);

				return;
			}

			router.push(result.data);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="text-foreground border-border w-full max-w-md rounded-3xl border bg-white p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] md:p-8">
			<h2 className="mb-5 text-2xl font-semibold">{translations.title}</h2>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<FormField
						control={form.control}
						name="interval"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<div className="bg-accent grid grid-cols-2 rounded-md p-1">
										{[
											{ value: DonationInterval.Monthly, label: translations.monthly },
											{ value: DonationInterval.OneTime, label: translations.oneTime },
										].map((option) => (
											<button
												key={option.value}
												type="button"
												onClick={() => form.setValue('interval', option.value)}
												className={cn(
													'cursor-pointer rounded-md px-3 py-2 text-sm font-semibold transition-colors',
													field.value === option.value && 'bg-white shadow-xs',
												)}
											>
												{option.label}
											</button>
										))}
									</div>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="amount"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<div className="flex flex-col gap-3">
										<div className="border-muted divide-muted grid grid-cols-5 divide-x overflow-hidden rounded-xl border">
											{amountPresets.map((preset) => (
												<button
													key={preset}
													type="button"
													onClick={() => form.setValue('amount', preset)}
													className={cn('p-2 text-sm font-medium transition-colors', field.value === preset && 'bg-muted')}
												>
													{preset}
												</button>
											))}
										</div>
										<div className="flex gap-2">
											<Input className="h-12 flex-1 rounded-xl" type="number" min={1} {...field} />
											<DonationCurrencySelector currencies={['USD', 'EUR', 'CHF']} className="w-28" />
										</div>
									</div>
								</FormControl>
							</FormItem>
						)}
					/>

					{showBankTransfer ? (
						<FormField
							control={form.control}
							name="paymentType"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<div className="bg-accent grid grid-cols-2 rounded-md p-1">
											{[
												{ value: PaymentTypes.CREDIT_CARD, label: translations.paymentType.creditCard },
												{ value: PaymentTypes.BANK_TRANSFER, label: translations.paymentType.bankTransfer },
											].map((option) => (
												<button
													key={option.value}
													type="button"
													onClick={() => form.setValue('paymentType', option.value as PaymentType)}
													className={cn(
														'cursor-pointer rounded-md px-2 py-2 text-xs font-semibold transition-colors sm:text-sm',
														field.value === option.value && 'bg-white shadow-xs',
													)}
												>
													{option.label}
												</button>
											))}
										</div>
									</FormControl>
									<p className="text-muted-foreground mt-2 text-center text-xs">{translations.feeNotice}</p>
								</FormItem>
							)}
						/>
					) : null}

					{isBankTransfer ? (
						<div className="bg-muted/40 rounded-2xl p-4">
							<BankTransferForm
								amount={amount}
								intervalCount={interval === DonationInterval.Monthly ? 1 : 0}
								translations={translations.bankTransfer}
								lang={lang}
								region={region}
								qrBillType="QRCODE"
							/>
						</div>
					) : (
						<Button type="submit" className="h-11 w-full text-sm font-semibold" disabled={submitting}>
							{translations.submit}
						</Button>
					)}
				</form>
			</Form>

			{daysLeft >= 0 ? <p className="text-muted-foreground mt-4 text-center text-sm">{daysLeftLabel}</p> : null}
		</div>
	);
};
