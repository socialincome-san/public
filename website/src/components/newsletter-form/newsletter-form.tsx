'use client';

import { CreateNewsletterSubscription } from '@/app/api/newsletter/subscription/public/route';
import { NewsletterPopupTranslations } from '@/components/newsletter-popup/newsletter-popup-client';
import { useApi } from '@/hooks/useApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input } from '@socialincome/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

type NewsletterForm = {
	lang: LanguageCode;
	translations: NewsletterPopupTranslations;
};

const NewsletterForm = ({ lang, translations }: NewsletterForm) => {
	const api = useApi();
	const formSchema = z.object({ email: z.string().email() });
	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '' },
	});

	const onSubmit = async (values: FormSchema) => {
		const body: CreateNewsletterSubscription = {
			email: values.email,
			language: lang === 'de' ? 'de' : 'en',
		};
		api.post('/api/newsletter/subscription/public', body).then((response) => {
			if (response.status === 200) {
				toast.dismiss(t.id);
				toast.success(translations.toastSuccess);
			} else {
				toast.error(translations.toastFailure);
			}
		});
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
