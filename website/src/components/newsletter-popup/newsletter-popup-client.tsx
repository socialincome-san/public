'use client';

import { CreateNewsletterSubscription } from '@/app/api/newsletter/subscription/public/route';
import NewsletterForm from '@/components/newsletter-form/newsletter-form';
import { NewsletterPopupProps } from '@/components/newsletter-popup/newsletter-popup';
import { useApi } from '@/hooks/useApi';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Typography } from '@socialincome/ui';
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
		<div
			className={classNames('relative flex w-[32rem] flex-col gap-4 rounded-lg bg-white px-4 py-6 duration-500', {
				'animate-in slide-in-from-right': t.visible,
				'animate-out slide-out-to-right-[36rem] fill-mode-forwards': !t.visible,
			})}
		>
			<XMarkIcon className="absolute right-0 top-0 m-1 h-5 w-5 cursor-pointer" onClick={onClose} />
			<Typography>{translations.informationLabel}</Typography>
			<NewsletterForm translations={translations} />
		</div>
	);
};

type NewsletterPopupClientProps = {
	translations: NewsletterPopupTranslations;
} & NewsletterPopupProps;

export const NewsletterPopupClient = ({ delay, lang, translations }: NewsletterPopupClientProps) => {
	useEffect(() => {
		if (localStorage.getItem('cookie_consent') === null) return; // Do not show the popup if the user has responded to the cookie consent banner
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
