import { DefaultPageProps } from '@/app/[lang]/[region]';
import { SubscriptionInfoForm } from '@/app/[lang]/[region]/(website)/updates/subscription-info-form';
import NewsletterOverlay from '@/components/newsletter-overlay/newsletter-overlay';

import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['common'],
	});

	return (
		<div className="mx-auto flex w-screen max-w-6xl flex-col space-y-4 md:px-5">
			<NewsletterOverlay
				lang={params.lang}
				region={params.region}
				translations={{
					gender: translator.t('updates.gender'),
					email: translator.t('updates.email'),
					country: translator.t('updates.country'),
					language: translator.t('updates.language'),
					alertMessage: translator.t('updates.alert-description'),
					submitButton: translator.t('updates.submit-button'),
					toastMessage: translator.t('updates.newsletter-updated-toast'),
				}}
			/>
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
					gender: translator.t('updates.gender'),
					email: translator.t('updates.email'),
					country: translator.t('updates.country'),
					language: translator.t('updates.language'),
					updatesSubmitButton: translator.t('updates.submit-button'),
					toastMessage: translator.t('updates.newsletter-updated-toast'),
				}}
			/>
		</div>
	);
}
