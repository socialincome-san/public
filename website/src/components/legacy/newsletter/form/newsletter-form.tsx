'use client';

import { subscribeToNewsletter } from '@/lib/server-actions/newsletter-actions';
import { CreateNewsletterSubscription } from '@/lib/services/sendgrid/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input } from '@socialincome/ui';
import { useForm } from 'react-hook-form';
import toast, { Toast } from 'react-hot-toast';
import * as z from 'zod';
import { NewsletterTranslations } from '../types';

type NewsletterFormProps = {
	lang: LanguageCode;
	t?: Toast;
	translations: NewsletterTranslations;
};

const NewsletterForm = ({ t, lang, translations }: NewsletterFormProps) => {
	const formSchema = z.object({ email: z.string().email() });
	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '' },
	});

	const onSubmit = async (values: FormSchema) => {
		const data: CreateNewsletterSubscription = {
			email: values.email,
			language: lang === 'de' ? 'de' : 'en',
		};

		try {
			await subscribeToNewsletter(data);
			if (t && t.id) {
				toast.dismiss(t.id);
			}
			toast.success(translations.toastSuccess);
		} catch (error) {
			toast.error(translations.toastFailure);
		}
	};

	return (
		<Form {...form}>
			<form
				className="flex w-full flex-col items-center justify-center gap-2 sm:flex-row"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem className="w-full max-w-full flex-1 sm:max-w-96">
							<FormControl>
								<Input type="email" placeholder={translations.emailPlaceholder} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full sm:w-full sm:max-w-[10rem]">
					{translations.buttonAddSubscriber}
				</Button>
			</form>
		</Form>
	);
};

export default NewsletterForm;
