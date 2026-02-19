'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { subscribeToNewsletterAction } from '@/lib/server-actions/newsletter-actions';
import { NewsletterSubscriptionData } from '@/lib/services/sendgrid/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	SpinnerIcon,
} from '@socialincome/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

type PersonalInfoFormProps = {
	translations: {
		firstname: string;
		email: string;
		submitButton: string;
		toastMessage: string;
		toastErrorMessage: string;
	};
} & DefaultParams;

export const SubscriptionInfoForm = ({ lang, translations }: PersonalInfoFormProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const formSchema = z.object({
		firstname: z.string(),
		email: z.string().email(),
	});

	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstname: '',
			email: '',
		},
	});

	const onSubmit = async (values: FormSchema) => {
		setIsSubmitting(true);
		const data: NewsletterSubscriptionData = {
			firstname: values.firstname,
			email: values.email,
			language: lang === 'de' ? 'de' : lang === 'fr' ? 'fr' : lang === 'it' ? 'it' : 'en',
		};

		try {
			await subscribeToNewsletterAction(data);
			toast.success(translations.toastMessage);
			form.reset();
		} catch (error) {
			toast.error(translations.toastErrorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form className="grid grid-cols-1 gap-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="firstname"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-md">{translations.firstname}</FormLabel>
							<FormControl>
								<Input type="text" className="h-14 w-full p-4 text-xl" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-md">{translations.email}</FormLabel>
							<FormControl>
								<Input type="email" className="h-14 w-full p-4 text-xl" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{isSubmitting ? (
					<div key="spinner" className="mt-4 flex justify-center">
						<SpinnerIcon />
					</div>
				) : (
					<Button key="button" type="submit" size="lg" color="accent" className="mt-4 rounded-full">
						{translations.submitButton}
					</Button>
				)}
			</form>
		</Form>
	);
};
