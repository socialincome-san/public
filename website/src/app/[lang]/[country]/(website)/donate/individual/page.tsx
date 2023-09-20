'use client';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { CreateSubscriptionData } from '@/app/api/stripe/checkout/new/route';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	BaseContainer,
	Button,
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
import { UseFormReturn, useForm } from 'react-hook-form';
import Stripe from 'stripe';
import * as z from 'zod';

// TODO: i18n
type RadioGroupFormItem = {
	active: boolean;
	value: '1' | '3' | '12';
	title: string;
	description: string;
	form: UseFormReturn<{ amount: number; intervalCount: '1' | '3' | '12' }, any, undefined>;
};

function RadioGroupFormItem({ active, title, value, form, description }: RadioGroupFormItem) {
	const updateForm = () => {
		const annualAmount = (form.getValues('amount') / Number(form.getValues('intervalCount'))) * 12;
		form.setValue('amount', (Number(value) / 12) * annualAmount);
		form.setValue('intervalCount', value);
	};

	return (
		<FormItem>
			<FormControl
				className={classNames(
					'flex flex-1 cursor-pointer flex-row rounded-lg border-2 p-4 shadow-sm focus:outline-none',
					{
						'border-si-yellow': active,
					},
				)}
			>
				<div className="theme-default" onClick={updateForm}>
					<span className="flex flex-1">
						<span className="flex flex-col">
							<Typography weight="bold">{title}</Typography>
							<Typography size="sm">{description}</Typography>
						</span>
					</span>
					<CheckCircleIcon
						className={classNames(!active ? 'invisible' : '', 'text-si-yellow h-5 w-5')}
						aria-hidden="true"
					/>
				</div>
			</FormControl>
		</FormItem>
	);
}

export default function Page({ params, searchParams }: DefaultPageProps) {
	const router = useRouter();

	const formSchema = z.object({
		amount: z.coerce.number(),
		intervalCount: z.enum(['1', '3', '12']),
	});
	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { intervalCount: '1', amount: Number(searchParams.amount) || 50 },
	});

	const onSubmit = async (values: FormSchema) => {
		const data: CreateSubscriptionData = {
			amount: values.amount * 100, // The amount is in cents, so we need to multiply by 100 to get the correct amount.
			intervalCount: Number(values.intervalCount),
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
		<BaseContainer className="flex min-h-screen flex-col items-center justify-center">
			<Typography color="primary-content" weight="bold" size="3xl" className="mb-12 text-center">
				How would you like to pay?
			</Typography>
			<Form {...form}>
				<form className="flex flex-col space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="intervalCount"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormControl>
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="grid grid-cols-3 gap-4"
									>
										<RadioGroupFormItem
											form={form}
											active={field.value === '1'}
											value="1"
											title="Monthly"
											description="Pay every month"
										/>
										<RadioGroupFormItem
											form={form}
											active={field.value === '3'}
											value="3"
											title="Quarterly"
											description="Pay every 3 months"
										/>
										<RadioGroupFormItem
											form={form}
											active={field.value === '12'}
											value="12"
											title="Yearly"
											description="Pay every year"
										/>
									</RadioGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex-inline flex items-center justify-center space-x-4">
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<Typography size="lg" color="primary-content" weight="bold">
										Amount
									</Typography>
									<FormControl>
										<Input type="number" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<Button size="lg" type="submit">
						Start Donating
					</Button>
				</form>
			</Form>
		</BaseContainer>
	);
}
