'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormControl, FormField, FormItem, Input } from '@socialincome/ui';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface Section1InputProps {
	text: string;
}

// TODO: i18n
export default function Section1Input({ text }: Section1InputProps) {
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
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="amount"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="number" placeholder="Amount" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
				<Button size="lg" type="submit">
					{text}
				</Button>
			</form>
		</Form>
	);
}
