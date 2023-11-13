'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { CreatePaymentData } from '@/app/api/stripe/checkout/new-payment/route';
import { useI18n } from '@/app/context-providers';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, Input } from '@socialincome/ui';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useUser } from 'reactfire';
import Stripe from 'stripe';
import * as z from 'zod';

type DonationFormProps = {
	translations: {
		submit: string;
		currency: string;
	};
} & DefaultParams;

export default function OneTimeDonationForm({ translations, lang, region }: DonationFormProps) {
	const router = useRouter();
	const { data: authUser } = useUser();
	const { currency } = useI18n();

	const formSchema = z.object({
		amount: z.coerce.number().min(1),
	});

	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { amount: '' as any },
	});

	const onSubmit = async (values: FormSchema) => {
		const authToken = await authUser?.getIdToken(true);
		const data: CreatePaymentData = {
			amount: values.amount * 100, // The amount is in cents, so we need to multiply by 100 to get the correct amount.
			currency: currency,
			successUrl: `${window.location.origin}/${lang}/${region}/donate/success?stripeCheckoutSessionId={CHECKOUT_SESSION_ID}`,
			recurring: false,
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
		<div className="flex flex-col space-y-8 text-center sm:text-left">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
					<div className="mb-4 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 md:items-center">
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem className="flex-1">
									<FormControl>
										<Input className="h-16 text-lg" placeholder="Amount" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<CurrencySelector className="h-16 flex-initial" currencies={['USD', 'EUR', 'CHF']} fontSize="lg" />
					</div>
					<Button size="lg" type="submit" variant="default">
						{translations.submit}
					</Button>
				</form>
			</Form>
		</div>
	);
}
