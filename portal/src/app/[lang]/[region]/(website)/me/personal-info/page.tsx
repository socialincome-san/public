import { DefaultPageProps } from '@/app/[lang]/[region]';
import { PersonalInfoForm } from '@/app/[lang]/[region]/(website)/me/personal-info/personal-info-form';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const { lang, region } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-me'] });

	return (
		<div className="space-y-8">
			<Alert variant="primary">
				<AlertTitle>{translator.t('personal-info.alert-title')}</AlertTitle>
				<AlertDescription>{translator.t('personal-info.alert-description')}</AlertDescription>
			</Alert>
			<PersonalInfoForm
				lang={lang}
				region={region}
				translations={{
					firstname: translator.t('personal-info.firstname'),
					lastname: translator.t('personal-info.lastname'),
					gender: translator.t('personal-info.gender'),
					email: translator.t('personal-info.email'),
					street: translator.t('personal-info.street'),
					streetNumber: translator.t('personal-info.street-number'),
					city: translator.t('personal-info.city'),
					zip: translator.t('personal-info.zip'),
					country: translator.t('personal-info.country'),
					language: translator.t('personal-info.language'),
					submitButton: translator.t('personal-info.submit-button'),
					userUpdatedToast: translator.t('personal-info.user-updated-toast'),
					newsletterSwitch: translator.t('personal-info.newsletter-switch'),
				}}
			/>
		</div>
	);
}
