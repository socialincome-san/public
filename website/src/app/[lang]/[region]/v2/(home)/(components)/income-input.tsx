'use client';

import { useI18n } from '@/components/providers/context-providers';
import { websiteCurrencies } from '@/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
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
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

export function IncomeInput() {
	const { currency } = useI18n();

	const formSchema = z.object({
		value: z.string(),
		currency: z.enum(websiteCurrencies as any),
	});

	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { value: '5000' as any, currency: currency },
	});

	useEffect(() => {
		form.setValue('currency', currency);
	}, [form, currency]);

	const onSubmit = async (values: FormSchema) => {
		alert(`You entered: ${values.value} ${values.currency}`);
	};

	return (
		<Form {...form}>
			<form
				className="mx-auto flex max-w-72 items-center justify-center border-b border-white border-opacity-40 pb-3 text-white"
				onSubmit={form.handleSubmit(onSubmit)}
			>
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
							<Select onValueChange={field.onChange}>
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
			</form>
		</Form>
	);
}
