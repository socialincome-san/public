'use client';

import NewsletterForm from '@/components/legacy/newsletter/form/newsletter-form';
import { NewsletterPopupProps } from '@/components/legacy/newsletter/popup/newsletter-popup';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Typography } from '@socialincome/ui';
import classNames from 'classnames';
import { useEffect } from 'react';
import toast, { Toast } from 'react-hot-toast';

export type NewsletterPopupTranslations = {
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
	return (
		<div
			className={classNames('relative flex w-[32rem] flex-col gap-4 rounded-lg bg-white px-4 py-6 duration-500', {
				'animate-in slide-in-from-right': t.visible,
				'animate-out slide-out-to-right-[36rem] fill-mode-forwards': !t.visible,
			})}
		>
			<XMarkIcon className="absolute right-0 top-0 m-1 h-5 w-5 cursor-pointer" onClick={onClose} />
			<Typography>{translations.informationLabel}</Typography>
			<NewsletterForm lang={lang} t={t} translations={translations} />
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
