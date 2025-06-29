import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { NewsletterPopupClient } from './newsletter-popup-client';

export type NewsletterPopupProps = {
	delay?: number; // Delay in milliseconds until the popup is shown
} & DefaultParams;

export default async function NewsletterPopup({ lang, region, delay = 0 }: NewsletterPopupProps) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-newsletter'],
	});
	return (
		<NewsletterPopupClient
			lang={lang}
			region={region}
			delay={delay}
			translations={{
				informationLabel: translator.t('popup.information-label'),
				toastSuccess: translator.t('popup.toast-success'),
				toastFailure: translator.t('popup.toast-failure'),
				emailPlaceholder: translator.t('popup.email-placeholder'),
				buttonAddSubscriber: translator.t('popup.button-subscribe'),
			}}
		/>
	);
}
