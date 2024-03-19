import { DefaultPageProps } from '@/app/[lang]/[region]';
import { SubscriptionInfoForm } from '@/app/[lang]/[region]/(website)/updates/subscription-info-form';
import NewsletterPopup from '@/components/newsletter-popup/newsletter-popup';

import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-newsletter'],
	});

	return (
		<div className="mx-auto flex w-screen max-w-6xl flex-col space-y-4 md:px-5">
			<NewsletterPopup lang={params.lang} region={params.region} delayTime={3000} />
			<Alert variant="primary">
				<AlertTitle>{translator.t('updates.alert-title')}</AlertTitle>
				<AlertDescription>{translator.t('updates.alert-description')}</AlertDescription>
			</Alert>
			<SubscriptionInfoForm
				lang={params.lang}
				region={params.region}
				translations={{
					firstname: translator.t('updates.firstname'),
					lastname: translator.t('updates.lastname'),
					email: translator.t('updates.email'),
					country: translator.t('updates.country'),
					language: translator.t('updates.language'),
					updatesSubmitButton: translator.t('updates.submit-button'),
					toastMessage: translator.t('updates.newsletter-updated-toast'),
					toastErrorMessage: translator.t('updates.newsletter-error-toast'),
				}}
			/>
		</div>
	);
}
