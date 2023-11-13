'use client';

import { CurrencySelector } from '@/components/ui/currency-selector';
import { websiteCurrencies } from '@/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, Input, Typography } from '@socialincome/ui';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface Section1InputProps {
	translations: {
		text: string;
		// amount: string;
		submit: string;
		currency: string;
	};
}

// TODO: i18n
export default function Section1Form({ translations }: Section1InputProps) {
	const router = useRouter();

	const formSchema = z.object({
		amount: z.coerce.number().min(1).optional(),
	});

	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { amount: '' as any },
	});

	const onSubmit = (values: FormSchema) => {
		router.push(`/donate/individual?amount=${(Number(values.amount) / 100).toFixed(2)}`);
	};

	return (
		<div className="flex flex-col space-y-8 text-center sm:text-left">
			<Typography size="2xl">{translations.text}</Typography>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-8">
					<div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 md:items-center">
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem className="sm:basis-2/3">
									<FormControl>
										<Input className="h-16 text-lg" placeholder="Amount" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<CurrencySelector className="h-16 sm:flex-1" currencies={websiteCurrencies} fontSize="lg" />
					</div>
					<Button size="lg" type="submit" variant="default" className="text-lg">
						{translations.submit}
					</Button>
				</form>
			</Form>
		</div>
	);
}
