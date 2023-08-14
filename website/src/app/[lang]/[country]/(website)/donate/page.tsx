'use client';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { CreateSubscriptionData } from '@/app/api/stripe/checkout/new/route';
import { BaseContainer, Button, Input } from '@socialincome/ui';
import { Formik } from 'formik';
import { FormikHelpers } from 'formik/dist/types';
import { useRouter } from 'next/navigation';
import Stripe from 'stripe';

type DonateFormValues = {
	amount: number;
};

export default function Page({ params, searchParams }: DefaultPageProps) {
	const router = useRouter();

	const goToStripeCheckout = async (values: DonateFormValues, { setSubmitting }: FormikHelpers<DonateFormValues>) => {
		setSubmitting(true);

		const data: CreateSubscriptionData = {
			amount: values.amount * 100, // The amount is in cents, so we need to multiply by 100 to get the correct amount.
			intervalCount: 12, // TODO: Make this dynamic
			successUrl: `${window.location.origin}/${params.lang}/${params.country}/donate/success?stripeCheckoutSessionId={CHECKOUT_SESSION_ID}`,
		};
		const response = await fetch('/api/stripe/checkout/new', {
			method: 'POST',
			body: JSON.stringify(data),
		});
		const { url } = (await response.json()) as Stripe.Response<Stripe.Checkout.Session>;

		// This sends the user to stripe.com where payment is completed
		if (url) router.push(url);
	};

	return (
		<BaseContainer>
			<Formik
				initialValues={{ amount: Number(searchParams.amount) }}
				validate={(values) => {
					if (!values.amount) {
						return { amount: 'Required' };
					}
				}}
				onSubmit={goToStripeCheckout}
			>
				{({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
					<form className="flex min-h-screen max-w-3xl flex-col space-y-2" onSubmit={handleSubmit}>
						<Input
							type="number"
							name="amount"
							placeholder="Amount" // TODO: i18n
							onChange={handleChange}
							onBlur={handleBlur}
							value={values.amount}
						/>
						{errors.amount && touched.amount && errors.amount}
						<Button type="submit" color="primary" disabled={isSubmitting}>
							Submit
						</Button>
					</form>
				)}
			</Formik>
		</BaseContainer>
	);
}
