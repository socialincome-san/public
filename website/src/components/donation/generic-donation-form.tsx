'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { CreateCheckoutSessionData } from '@/app/api/stripe/checkout-session/create/route';
import { BankTransferForm, BankTransferFormProps } from '@/components/donation/bank-transfer-form';
import { DonationInterval } from '@/components/donation/donation-interval';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { useI18n } from '@/lib/i18n/useI18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, Input } from '@socialincome/ui';
import { ToggleGroup, ToggleGroupItem } from '@socialincome/ui/src/components/toggle-group';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Stripe from 'stripe';
import * as z from 'zod';

type DonationFormProps = {
	defaultInterval: DonationInterval;
	translations: {
		monthly: string;
		oneTime: string;
		amount: string;
		submit: string;
		paymentType: {
			bankTransfer: string;
			creditCard: string;
		};
		bankTransfer: BankTransferFormProps['translations'];
	};
	campaignId?: string;
} & DefaultParams;

export const PaymentTypes = {
	CREDIT_CARD: 'credit_card',
	BANK_TRANSFER: 'bank_transfer',
} as const;

export type PaymentType = (typeof PaymentTypes)[keyof typeof PaymentTypes];

export function GenericDonationForm({ defaultInterval, translations, lang, region, campaignId }: DonationFormProps) {
	const router = useRouter();
	const { authUser } = useAuth();
	const { currency } = useI18n();
	const [submitting, setSubmitting] = useState(false);

	const formSchema = z
		.object({
			interval: z.coerce.string(),
			paymentType: z.enum(Object.values(PaymentTypes) as [string, ...string[]]).default(PaymentTypes.CREDIT_CARD),
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
			interval: defaultInterval,
			amount: 100,
			paymentType: PaymentTypes.CREDIT_CARD,
			email: '',
			firstName: '',
			lastName: '',
		},
	});
	const interval = form.watch('interval');

	const onSubmit = async (values: FormSchema) => {
		setSubmitting(true);
		const authToken = await authUser?.getIdToken(true);
		const data: CreateCheckoutSessionData = {
			amount: values.amount * 100, // The amount is in cents, so we need to multiply by 100 to get the correct amount.
			currency: currency,
			successUrl: `${window.location.origin}/${lang}/${region}/donate/success/stripe/{CHECKOUT_SESSION_ID}`,
			recurring: values.interval === DonationInterval.Monthly,
			intervalCount: values.interval === DonationInterval.Monthly ? 1 : undefined,
			firebaseAuthToken: authToken,
			campaignId: campaignId,
		};

		const response = await fetch('/api/stripe/checkout-session/create', { method: 'POST', body: JSON.stringify(data) });
		const { url } = (await response.json()) as Stripe.Response<Stripe.Checkout.Session>;
		// This sends the user to stripe.com where payment is completed
		if (url) router.push(url);
	};

	return (
		<div className="flex flex-col space-y-8 text-center sm:text-left">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
					<FormField
						control={form.control}
						name="interval"
						render={({ field }) => (
							<FormItem className="flex-1 sm:basis-2/3">
								<FormControl>
									<ToggleGroup
										type="single"
										className={'bg-popover mb-4 inline-flex rounded-full'}
										value={field.value}
										onValueChange={(v) => form.setValue('interval', v)}
									>
										<ToggleGroupItem
											key={DonationInterval.OneTime}
											className="text-md m-1 rounded-full px-6"
											value={DonationInterval.OneTime}
										>
											{translations.oneTime}
										</ToggleGroupItem>
										<ToggleGroupItem
											key={DonationInterval.Monthly}
											className="text-md m-1 rounded-full px-6"
											value={DonationInterval.Monthly}
										>
											{translations.monthly}
										</ToggleGroupItem>
									</ToggleGroup>
								</FormControl>
							</FormItem>
						)}
					></FormField>
					<div className={'mb-4'}>
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem className="flex-1 sm:basis-2/3">
									<FormControl>
										<div>
											<ToggleGroup
												type="single"
												className={'mb-4'}
												value={field.value.toString()}
												onValueChange={(v) => {
													if (v) {
														form.setValue('amount', Number.parseInt(v));
													}
												}}
											>
												{createToggleGroupItems(
													interval === DonationInterval.Monthly ? [10, 30, 100, 150, 200] : [25, 50, 100, 500, 1000],
												)}
											</ToggleGroup>
											<div className="flex flex-col sm:flex-row sm:space-x-2 sm:space-y-0 md:items-center">
												<Input className="mb-4 h-12 text-lg sm:mb-0" {...field} />
												<CurrencySelector
													className="h-12 sm:basis-1/3 md:max-w-[12rem]"
													currencies={['USD', 'EUR', 'CHF']}
													fontSize="md"
												/>
											</div>
										</div>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
					{region === 'ch' && ['CHF', 'EUR'].includes(currency || '') && (
						<div className="flex flex-col space-y-4">
							<FormField
								control={form.control}
								name="paymentType"
								render={({ field }) => (
									<FormItem className="flex-1 sm:basis-2/3">
										<FormControl>
											<ToggleGroup
												type="single"
												className="bg-popover mb-4 inline-flex rounded-full"
												value={field.value}
												onValueChange={(value) => form.setValue('paymentType', value)}
											>
												<ToggleGroupItem className="text-md m-1 rounded-full px-6" value={PaymentTypes.CREDIT_CARD}>
													{translations.paymentType.creditCard}
												</ToggleGroupItem>
												<ToggleGroupItem className="text-md m-1 rounded-full px-6" value={PaymentTypes.BANK_TRANSFER}>
													{translations.paymentType.bankTransfer}
												</ToggleGroupItem>
											</ToggleGroup>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
					)}
					{form.watch('paymentType') === PaymentTypes.BANK_TRANSFER ? (
						<div className="flex flex-col space-y-4 rounded-lg bg-blue-50 p-4 md:p-8">
							<BankTransferForm
								amount={form.watch('amount')}
								intervalCount={form.watch('interval') === DonationInterval.Monthly ? 1 : 0}
								translations={translations.bankTransfer}
								lang={lang}
								region={region}
								qrBillType="QRCODE"
							/>
						</div>
					) : (
						<Button
							size="lg"
							type="submit"
							variant="default"
							showLoadingSpinner={submitting}
							className="bg-accent text-accent-foreground hover:bg-accent-muted active:bg-accent-muted rounded-full text-lg font-medium"
						>
							{translations.submit}
						</Button>
					)}
				</form>
			</Form>
		</div>
	);
}

const createToggleGroupItems = (values: number[]) => {
	return values.map((value) => (
		<ToggleGroupItem
			key={value}
			style={{ width: '100%' }}
			className="text-md bg-popover rounded-full py-6"
			value={value.toString()}
		>
			{value}
		</ToggleGroupItem>
	));
};
