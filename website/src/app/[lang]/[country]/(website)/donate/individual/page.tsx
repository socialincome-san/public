'use client';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { CreateSubscriptionData } from '@/app/api/stripe/checkout/new/route';
import { RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { BaseContainer, Button, Input, Theme, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import { Formik, useFormikContext } from 'formik';
import { FormikHelpers } from 'formik/dist/types';
import { useRouter } from 'next/navigation';
import Stripe from 'stripe';

type DonateFormValues = {
	amount: number;
	intervalCount: number;
};

// TODO: i18n
function IntervalCountRadioGroup() {
	const { setFieldValue, values } = useFormikContext<DonateFormValues>();

	const intervalCountOptions = [
		{ title: 'Monthly', description: 'Pay every month', value: 1 },
		{ title: 'Quarterly', description: 'Pay every 3 months', value: 3 },
		{ title: 'Annually', description: 'Pay every year', value: 12 },
	];

	return (
		<RadioGroup
			name="intervalCount"
			value={values.intervalCount}
			onChange={(value) => {
				const annualAmount = (values.amount / values.intervalCount) * 12;
				void setFieldValue('amount', (value / 12) * annualAmount);
				void setFieldValue('intervalCount', value);
			}}
		>
			<div className="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
				{intervalCountOptions.map((option, index) => (
					<RadioGroup.Option
						key={index}
						value={option.value}
						className={({ checked }) =>
							classNames(
								checked ? 'border-accent' : 'border-neutral',
								'bg-base-100 relative flex cursor-pointer rounded-lg border-2 p-4 shadow-sm focus:outline-none',
							)
						}
					>
						{({ checked }) => (
							<>
								<span className="flex flex-1">
									<span className="flex flex-col">
										<Typography weight="bold">{option.title}</Typography>
										<Typography size="sm">{option.description}</Typography>
									</span>
								</span>
								<CheckCircleIcon
									className={classNames(!checked ? 'invisible' : '', 'text-accent h-5 w-5')}
									aria-hidden="true"
								/>
							</>
						)}
					</RadioGroup.Option>
				))}
			</div>
		</RadioGroup>
	);
}

export default function Page({ params, searchParams }: DefaultPageProps) {
	const router = useRouter();

	const onSubmit = async (values: DonateFormValues, { setSubmitting }: FormikHelpers<DonateFormValues>) => {
		setSubmitting(true);

		const data: CreateSubscriptionData = {
			amount: values.amount * 100, // The amount is in cents, so we need to multiply by 100 to get the correct amount.
			intervalCount: values.intervalCount,
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
		<Theme className="bg-primary" dataTheme="siDefault">
			<BaseContainer className="flex min-h-screen flex-col items-center justify-center pb-24">
				<Typography color="primary-content" weight="medium" size="3xl" className="mb-12 text-center">
					How would you like to pay?
				</Typography>
				<Formik
					initialValues={{ amount: Number(searchParams.amount), intervalCount: 1 }}
					validate={(values) => {
						if (!values.amount) {
							return { amount: 'Required' };
						}
					}}
					onSubmit={onSubmit}
				>
					{({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
						<form className="flex flex-col space-y-8" onSubmit={handleSubmit}>
							<IntervalCountRadioGroup />
							<div className="flex-inline flex items-center justify-center space-x-4">
								<Typography size="lg" color="primary-content" weight="bold">
									Amount
								</Typography>
								<Input
									type="number"
									name="amount"
									size="lg"
									placeholder="Amount"
									onChange={handleChange}
									onBlur={handleBlur}
									value={values.amount}
								/>
							</div>
							{errors.amount && touched.amount && errors.amount}
							<Button size="lg" type="submit" color="accent" disabled={isSubmitting || !values.amount}>
								Start Donating
							</Button>
						</form>
					)}
				</Formik>
			</BaseContainer>
		</Theme>
	);
}
