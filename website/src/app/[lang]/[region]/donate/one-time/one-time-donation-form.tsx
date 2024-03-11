'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { CreateCheckoutSessionData } from '@/app/api/stripe/checkout-session/create/route';
import { useI18n } from '@/app/context-providers';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, Input } from '@socialincome/ui';
import { ToggleGroup, ToggleGroupItem } from '@socialincome/ui/src/components/toggle-group';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from 'reactfire';
import Stripe from 'stripe';
import * as z from 'zod';

type DonationFormProps = {
	translations: {
		monthly: string;
		oneTime: string;
		amount: string;
		submit: string;
	};
	campaignId?: string;
} & DefaultParams;

enum DonationInterval {
	OneTime = 'one-time',
	Monthly = 'monthly',
}

export default function OneTimeDonationForm({ translations, lang, region, campaignId }: DonationFormProps) {
	const router = useRouter();
	const { data: authUser } = useUser();
	const { currency } = useI18n();
	const [submitting, setSubmitting] = useState(false);

	const formSchema = z.object({
		interval: z.coerce.string(),
		amount: z.coerce.number().min(1),
	});

	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { interval: DonationInterval.OneTime, amount: 100 },
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
										className={'bg-popover mb-4 rounded-full inline-flex'}
										value={field.value}
										onValueChange={(v) => form.setValue('interval', v)}
									>
										<ToggleGroupItem className="text-md rounded-full m-1 px-6" value={DonationInterval.OneTime}>
											{translations.oneTime}
										</ToggleGroupItem>
										<ToggleGroupItem className="text-md rounded-full m-1 px-6" value={DonationInterval.Monthly}>
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
										<>
											<ToggleGroup
												type="single"
												className={'mb-4'}
												value={field.value.toString()}
												onValueChange={(v) => form.setValue('amount', Number.parseInt(v))}
											>
												{createToggleGroupItems(
													interval === DonationInterval.Monthly ? [40, 60, 100, 200, 300] : [25, 50, 100, 500, 1000],
												)}
											</ToggleGroup>
											<div className="flex flex-col sm:flex-row sm:space-x-2 sm:space-y-0 md:items-center">
												<Input className="h-12 text-lg mb-4 sm:mb-0" {...field} />
												<CurrencySelector
													className="h-12 sm:basis-1/3 md:max-w-[12rem]"
													currencies={['USD', 'EUR', 'CHF']}
													fontSize="md"
												/>
											</div>
										</>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
					<Button size="lg" type="submit" variant="default" showLoadingSpinner={submitting}  className="bg-accent text-accent-foreground rounded-full font-medium text-lg hover:bg-accent-muted active:bg-accent-muted">
						{translations.submit}
					</Button>
				</form>
			</Form>
		</div>
	);
}

const createToggleGroupItems = (values: number[]) => {
	return values.map((value) => (
		<ToggleGroupItem key={value} style={{ width: '100%' }} className="text-md py-6 bg-popover rounded-full" value={value.toString()}>
			{value}
		</ToggleGroupItem>
	));
};
