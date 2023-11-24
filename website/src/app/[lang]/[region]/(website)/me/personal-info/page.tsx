import { DefaultPageProps } from '@/app/[lang]/[region]';
import { PersonalInfoForm } from '@/app/[lang]/[region]/(website)/me/personal-info/personal-info-form';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({ language: params.lang, namespaces: ['website-me'] });
	return (
		<div className="space-y-12">
			<PersonalInfoForm
				lang={params.lang}
				region={params.region}
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
				}}
			/>
		</div>
	);
}
