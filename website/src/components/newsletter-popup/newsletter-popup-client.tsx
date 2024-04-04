'use client';

import { CreateNewsletterSubscription } from '@/app/api/newsletter/subscription/public/route';
import { NewsletterPopupProps } from '@/components/newsletter-popup/newsletter-popup';
import { useApi } from '@/hooks/useApi';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toast } from 'react-hot-toast';
import * as z from 'zod';

type NewsletterPopupTranslations = {
	informationLabel: string;
	toastSuccess: string;
	toastFailure: string;
	emailPlaceholder: string;
	buttonAddSubscriber: string;
};

type NewsletterPopupToastProps = {
	lang: LanguageCode;
	translations: NewsletterPopupTranslations;
	t: Toast;
	onClose: () => void;
};

const NewsletterPopupToast = ({ lang, translations, t, onClose }: NewsletterPopupToastProps) => {
	const api = useApi();
	const formSchema = z.object({ email: z.string().email() });
	type FormSchema = z.infer<typeof formSchema>;
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '' },
	});

	const onSubmit = async (values: FormSchema) => {
		const body: CreateNewsletterSubscription = { email: values.email, language: lang as any };
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
		<div
			className={classNames('relative flex flex-col gap-4 rounded-lg bg-white px-4 py-6 duration-500', {
				'w-[32rem]': !t.visible, // Assuming the initial width is for non-visible state or specific animations
				'sm:w-full': t.visible, // Makes the width 100% of the viewport on small screens when visible
				'md:w-1/2': t.visible, // Makes the width 50% of the viewport on medium screens when visible
				'lg:w-2/5': t.visible, // Adjusts the width to 2/5 of the viewport on large screens when visible
				'animate-in slide-in-from-right': t.visible,
				'animate-out slide-out-to-right-[36rem] fill-mode-forwards': !t.visible,
			})}
		>
			<XMarkIcon className="absolute right-0 top-0 m-1 h-5 w-5 cursor-pointer" onClick={onClose} />
			<Typography>{translations.informationLabel}</Typography>
			<Form {...form}>
				<form className="flex flex-wrap gap-2" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem className="flex-1 min-w-[150px]">
								<FormControl>
									<Input type="email" placeholder={translations.emailPlaceholder} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit"
									className="w-full border border-primary bg-transparent rounded-full px-12 truncate text-primary hover:bg-primary hover:text-white sm:w-auto">
						{translations.buttonAddSubscriber}
					</Button>
				</form>
			</Form>
		</div>
	);
};

type NewsletterPopupClientProps = {
	translations: NewsletterPopupTranslations;
} & NewsletterPopupProps;

export const NewsletterPopupClient = ({ delay, lang, translations }: NewsletterPopupClientProps) => {
	useEffect(() => {
		toast.dismiss();
		const timeout = setTimeout(() => {
			toast.custom(
				(t) => (
					<NewsletterPopupToast lang={lang} t={t} translations={translations} onClose={() => toast.dismiss(t.id)} />
				),
				{
					position: 'bottom-right',
					duration: Infinity,
				},
			);
		}, delay);
		return () => {
			clearTimeout(timeout);
		};
	}, [delay, lang, translations]);

	return null;
};
