'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { NewsletterPopupClient } from './newsletter-popup-client';

type NewsletterPopupProps = {
	delayTime: number;
} & DefaultParams;

export default function NewsletterPopup({ lang, region, delayTime = 20000 }: NewsletterPopupProps) {
	useEffect(() => {
		const loadTranslations = async () => {
			const translator = await Translator.getInstance({
				language: lang,
				namespaces: ['website-newsletter'],
			});
			setTimeout(() => {
				toast(
					(t) => (
						<NewsletterPopupClient
							toast={t}
							translations={{
								errorNoEmail: translator.t('popup.error-no-email'),
								errorInvalidEmail: translator.t('popup.error-invalid-email'),
								informationLabel: translator.t('popup.information-label'),
								toastSuccess: translator.t('popup.toast-success'),
								toastFailure: translator.t('popup.toast-failure'),
								emailPlaceholder: translator.t('popup.email-placeholder'),
								buttonAddSubscriber: translator.t('popup.button-add-subscriber'),
							}}
						/>
					),
					{
						position: 'bottom-right',
						duration: 100000,
					},
				);
			}, delayTime);
		};
		loadTranslations();
	}, []);

	return null;
}
