'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { useApi } from '@/hooks/useApi';
import { useTranslator } from '@/hooks/useTranslator';
import { zodResolver } from '@hookform/resolvers/zod';
import { NewsletterSubscriptionData } from '@socialincome/shared/src/mailchimp/MailchimpAPI';
import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
} from '@socialincome/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';
import { useState } from "react";

type PersonalInfoFormProps = {
	translations: {
		firstname: string;
		email: string;
		updatesSubmitButton: string;
		toastMessage: string;
		toastErrorMessage: string;
	};
} & DefaultParams;

export function SubscriptionInfoForm({ lang, translations }: PersonalInfoFormProps) {
	const api = useApi();
	const [submitting, setSubmitting] = useState(false);

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
		setSubmitting(true);
		const data: NewsletterSubscriptionData = {
			firstname: values.firstname,
			email: values.email,
			status: 'subscribed',
		};

		api.post('/api/newsletter/subscription/public', data).then((response) => {
			if (response.status === 200) {
				toast.success(translations.toastMessage);
			} else {
				toast.error(translations.toastErrorMessage + '(' + response.statusText + ')');
			}
		});
	};

	return (
		<Form {...form}>
			<form className="grid grid-cols-1 gap-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="firstname"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-md text-primary-foreground-muted font-normal">{translations.firstname}</FormLabel>
							<FormControl>
								<Input type="text" className="h-14 text-xl p-4 w-full" {...field} />
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
							<FormLabel className="text-md text-primary-foreground-muted font-normal">{translations.email}</FormLabel>
							<FormControl>
								<Input type="email" className="h-14 text-xl p-4 w-full" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					size="lg"
					type="submit"
					variant="default"
					showLoadingSpinner={submitting}
					className="bg-accent text-accent-foreground hover:bg-accent-muted active:bg-accent-muted rounded-full text-lg font-medium mt-4">
					{translations.updatesSubmitButton}
				</Button>
			</form>
		</Form>
	);
}
