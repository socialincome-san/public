'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { websiteCurrencies, WebsiteCurrency } from '@/lib/i18n/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@socialincome/ui';
import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

export const IncomeInput = ({ translations }: { translations: { buttonText: string } }) => {
	const { currency, language, region, setCurrency } = useI18n();
	const router = useRouter();

	const formSchema = z.object({
		value: z.string(),
		currency: z.enum(websiteCurrencies as any),
	});

	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { value: '' as any, currency: '' as any },
	});

	useEffect(() => {
		form.setValue('currency', currency);
		form.setValue('value', currency === 'CHF' ? '5000' : '2000');
	}, [form, currency]);

	const onSubmit = async (values: FormSchema) => {
		setCurrency(values.currency);
		router.push(`/${language}/${region}/donate/individual?amount=${values.value}`);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="border-opacity-40 mx-auto flex max-w-72 items-center justify-center border-b border-white pb-3 text-white">
					<FormField
						control={form.control}
						name="value"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										type="number"
										className={classNames(
											'bg-background h-full w-full border-none text-right text-5xl text-white opacity-40 focus-visible:opacity-100 focus-visible:ring-0',
											'[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none', // hide input number arrows
										)}
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="currency"
						render={({ field }) => (
							<FormItem>
								<Select
									onValueChange={(value: WebsiteCurrency) => {
										setCurrency(value);
										field.onChange(value);
									}}
								>
									<FormControl>
										<SelectTrigger className="w-20 border-none bg-transparent text-lg text-white focus:ring-0">
											<SelectValue placeholder={field.value} />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{websiteCurrencies.map((currency) => (
											<SelectItem key={currency} value={currency}>
												{currency}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormItem>
						)}
					/>
				</div>
				<Button type="submit" className="mx-auto mt-10 md:block">
					{translations.buttonText}
				</Button>
			</form>
		</Form>
	);
};
