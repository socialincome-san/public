'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { websiteCurrencies } from '@/i18n';
import { EyeSlashIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, Input, Typography } from '@socialincome/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

type Section1InputProps = {
	translations: {
		text: string;
		amount: string;
		submit: string;
		currency: string;
		privacyCommitment: string;
		taxDeductible: string;
		oneTimeDonation: string;
	};
} & DefaultParams;

export default function Section1Form({ translations, lang, region }: Section1InputProps) {
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
		<div className="flex flex-col space-y-8 sm:text-left">
			<Typography size="2xl">{translations.text}</Typography>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-2">
					<div className="mb-2 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 md:items-center">
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem className="sm:basis-2/3">
									<FormControl>
										<Input className="h-16 text-lg" placeholder={translations.amount} {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<CurrencySelector className="h-16 w-full sm:flex-1" currencies={websiteCurrencies} fontSize="lg" />
					</div>
					<Button size="lg" type="submit" variant="default" className="text-lg">
						{translations.submit}
					</Button>
					<Link href={`/${lang}/${region}/privacy`} className="inline-flex items-center pt-2 hover:underline">
						<EyeSlashIcon className="mr-2 h-4 w-4" />
						<Typography size="sm">{translations.privacyCommitment}</Typography>
					</Link>
					{region === 'ch' && (
						<div className="inline-flex items-center">
							<CheckIcon className="mr-2 h-4 w-4" />
							<Typography size="sm">{translations.taxDeductible}</Typography>
						</div>
					)}
				</form>
			</Form>
			<div className="flex flex-row">
				<div className="flex-1" />
				<Link href={`/${lang}/${region}/donate/one-time`}>
					<Button variant="link">{translations.oneTimeDonation}</Button>
				</Link>
			</div>
		</div>
	);
}
