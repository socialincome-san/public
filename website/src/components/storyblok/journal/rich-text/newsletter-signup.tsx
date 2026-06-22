'use client';

import { Button } from '@/components/button';
import { subscribeToNewsletterAction } from '@/lib/server-actions/newsletter-actions';
import type { CreateNewsletterSubscription } from '@/lib/services/sendgrid/types';
import type { LanguageCode } from '@/lib/types/language';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage, Input } from '@socialincome/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

export type NewsletterSignupLabels = {
	title: string;
	emailPlaceholder: string;
	submitLabel: string;
	successMessage: string;
	errorMessage: string;
};

type Props = {
	lang: LanguageCode;
	labels: NewsletterSignupLabels;
};

const formSchema = z.object({ email: z.string().email() });

export const NewsletterSignup = ({ lang, labels }: Props) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '' },
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const subscription: CreateNewsletterSubscription = {
			email: values.email,
			language: lang === 'de' ? 'de' : 'en',
		};

		try {
			await subscribeToNewsletterAction(subscription);
			toast.success(labels.successMessage);
			form.reset();
		} catch {
			toast.error(labels.errorMessage);
		}
	};

	return (
		<div className="bg-card border-border my-10 rounded-2xl border p-6 md:p-8">
			<h3 className="text-foreground mb-6 text-center text-2xl font-semibold">{labels.title}</h3>
			<Form {...form}>
				<form className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem className="flex-1">
								<FormControl>
									<Input type="email" placeholder={labels.emailPlaceholder} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="shrink-0">
						{labels.submitLabel}
					</Button>
				</form>
			</Form>
		</div>
	);
};
